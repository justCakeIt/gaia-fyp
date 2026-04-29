"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchUserReminders, type UserReminder } from "@/lib/api";

function getUserID(session: unknown): number | null {
  const user = (session as { user?: { id?: string } } | null)?.user;
  const n = user?.id ? parseInt(user.id, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isDayMatch(dayOfWeek: string | null): boolean {
  if (!dayOfWeek || dayOfWeek === "Daily") return true;
  const now = new Date();
  const day = now.getDay();
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  switch (dayOfWeek) {
    case "Mon-Fri": return day >= 1 && day <= 5;
    case "Weekends": return day === 0 || day === 6;
    default: return names[day] === dayOfWeek;
  }
}

function isReminderDue(reminder: UserReminder): boolean {
  if (!reminder.enabled || !reminder.remindTime) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [rh, rm] = reminder.remindTime.slice(0, 5).split(":").map(Number);
  const reminderMinutes = rh * 60 + rm;
  return currentMinutes === reminderMinutes && isDayMatch(reminder.dayOfWeek);
}

function firedKey(reminder: UserReminder): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const hhmm = reminder.remindTime!.slice(0, 5);
  return `gaia-fired-${reminder.reminderID}-${date}-${hhmm}`;
}

type InAppAlert = {
  id: string;
  label: string;
  planTitle: string | null;
};

export default function ReminderNotificationEngine() {
  const { data: session } = useSession();
  const userID = getUserID(session);

  const [reminders, setReminders] = useState<UserReminder[]>([]);
  const [alerts, setAlerts] = useState<InAppAlert[]>([]);
  const remindersRef = useRef<UserReminder[]>([]);

  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  // Fetch reminders when userID is available
  useEffect(() => {
    if (!userID) return;
    fetchUserReminders(userID).then(setReminders);
  }, [userID]);

  // Re-fetch every 60s to pick up newly created reminders
  useEffect(() => {
    if (!userID) return;
    const id = setInterval(() => {
      fetchUserReminders(userID).then(setReminders);
    }, 60_000);
    return () => clearInterval(id);
  }, [userID]);

  // Poll every 15s to check if any reminder is due
  useEffect(() => {
    if (!userID) return;

    function check() {
      for (const rem of remindersRef.current) {
        if (!isReminderDue(rem)) continue;

        const key = firedKey(rem);
        if (sessionStorage.getItem(key)) continue;
        sessionStorage.setItem(key, "1");

        // Browser notification (if permission granted)
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("G.A.I.A. Reminder", {
              body: rem.label + (rem.planTitle ? ` · ${rem.planTitle}` : ""),
              icon: "/favicon.ico",
              tag: `gaia-reminder-${rem.reminderID}`,
            });
          } catch {
            // Silently ignore — browser may restrict in certain contexts
          }
        }

        // In-app toast (always shown)
        const alertID = `${rem.reminderID}-${Date.now()}`;
        setAlerts((prev) => [
          ...prev,
          { id: alertID, label: rem.label, planTitle: rem.planTitle },
        ]);
        setTimeout(() => {
          setAlerts((prev) => prev.filter((a) => a.id !== alertID));
        }, 15_000);
      }
    }

    check();
    const id = setInterval(check, 5_000);
    return () => clearInterval(id);
  }, [userID]);

  if (alerts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      aria-atomic="false"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxWidth: "min(340px, calc(100vw - 2rem))",
        pointerEvents: "none",
      }}
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          role="alert"
          className="gaia-reminder-toast"
          style={{ pointerEvents: "auto" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "0.6rem",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(140,200,160,0.9)",
                  fontFamily: "var(--gaia-font-body)",
                }}
              >
                Reminder
              </p>
              <p
                style={{
                  margin: "0.22rem 0 0",
                  fontSize: "0.92rem",
                  color: "rgba(220,248,232,0.92)",
                  lineHeight: 1.45,
                  fontFamily: "var(--gaia-font-heading)",
                  fontWeight: 500,
                }}
              >
                {alert.label}
                {alert.planTitle && (
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.78rem",
                      opacity: 0.6,
                      fontFamily: "var(--gaia-font-body)",
                      fontWeight: 400,
                      marginTop: "0.1rem",
                    }}
                  >
                    {alert.planTitle}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
              }
              aria-label="Dismiss reminder"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(140,200,160,0.7)",
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1,
                padding: "0.1rem 0.2rem",
                flexShrink: 0,
                marginTop: "0.05rem",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

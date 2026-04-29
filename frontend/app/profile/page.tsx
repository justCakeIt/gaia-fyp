"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  fetchUserPlans,
  fetchUserReminders,
  deleteReminder,
  deletePlan,
  createReminder,
  type UserPlan,
  type UserReminder,
} from "@/lib/api";
import NavArrows from "@/components/NavArrows";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  id?: string;
  provider?: string;
};

type DashboardData = {
  plans: UserPlan[];
  reminders: UserReminder[];
  loading: boolean;
  error: string | null;
};

type ReminderForm =
  | { open: false }
  | {
      open: true;
      planID: number;
      label: string;
      time: string;
      day: string;
      saving: boolean;
      error: string;
    };

function formatTime(t: string | null): string {
  if (!t) return "No time set";
  return t.slice(0, 5);
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [dash, setDash] = useState<DashboardData>({
    plans: [],
    reminders: [],
    loading: true,
    error: null,
  });
  const [form, setForm] = useState<ReminderForm>({ open: false });

  // Inline confirmation states — hold the ID being confirmed, or null
  const [confirmDeletePlan, setConfirmDeletePlan] = useState<number | null>(null);
  const [confirmDeleteReminder, setConfirmDeleteReminder] = useState<number | null>(null);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const user = session?.user as SessionUser | undefined;
  const userID = (() => {
    const n = user?.id ? parseInt(user.id, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  })();
  const displayName = user?.name?.trim() || "Gaia Member";

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/entry");
  }, [status, router]);

  useEffect(() => {
    if (!userID) return;
    let cancelled = false;

    Promise.all([fetchUserPlans(userID), fetchUserReminders(userID)])
      .then(([plans, reminders]) => {
        if (!cancelled) setDash({ plans, reminders, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled)
          setDash((d) => ({
            ...d,
            loading: false,
            error:
              "Could not load dashboard data. Make sure the backend is running.",
          }));
      });

    return () => { cancelled = true; };
  }, [userID]);

  if (status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card gaia-loading-card">
            <h2>Loading your dashboard...</h2>
            <p>Checking your session.</p>
          </article>
        </section>
      </main>
    );
  }

  if (!session?.user) return null;

  // Most recent plan — used for quick actions and reminder form
  const activePlan: UserPlan | null = dash.plans[0] ?? null;

  async function handleDeletePlan(planID: number) {
    if (!userID) return;
    const result = await deletePlan(planID, userID);
    if (result.ok) {
      setDash((d) => ({
        ...d,
        plans: d.plans.filter((p) => p.planID !== planID),
      }));
      setConfirmDeletePlan(null);
    }
  }

  async function handleDeleteReminder(reminderID: number) {
    if (!userID) return;
    const result = await deleteReminder(reminderID, userID);
    if (result.ok) {
      setDash((d) => ({
        ...d,
        reminders: d.reminders.filter((r) => r.reminderID !== reminderID),
      }));
      setConfirmDeleteReminder(null);
    }
  }

  function openReminderForm(plan: UserPlan) {
    // Request permission on this user gesture so browser allows it
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(setNotifPermission);
    }
    setForm({
      open: true,
      planID: plan.planID,
      label: `${plan.title} — daily check-in`,
      time: "08:00",
      day: "Daily",
      saving: false,
      error: "",
    });
  }

  function setOneMinFromNow() {
    if (!form.open) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setForm({ ...form, time: `${hh}:${mm}` });
  }

  async function requestNotifPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  }

  async function handleAddReminder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.open || !userID) return;

    if (!form.label.trim()) {
      setForm({ ...form, error: "Reminder label cannot be empty." });
      return;
    }

    setForm({ ...form, saving: true, error: "" });

    const result = await createReminder({
      userID,
      planID: form.planID,
      label: form.label.trim(),
      remindTime: form.time || null,
      dayOfWeek: form.day || null,
    });

    if (!result.ok) {
      setForm({ ...form, saving: false, error: result.error });
      return;
    }

    const reminders = await fetchUserReminders(userID);
    setDash((d) => ({ ...d, reminders }));
    setForm({ open: false });
  }

  // Shared inline styles for plan/reminder list items
  const listItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    padding: "0.7rem 0.85rem",
    borderRadius: "0.5rem",
    background: "var(--gaia-surface, rgba(0,0,0,0.03))",
    border: "1px solid var(--gaia-border, rgba(0,0,0,0.07))",
  };

  const smallBtnStyle: React.CSSProperties = {
    fontSize: "0.78rem",
    padding: "0.25rem 0.6rem",
  };

  return (
    <main className="gaia-page">
      <section className="gaia-shell">

        {/* ── Header ── */}
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Your Dashboard</p>
          <h1 style={{ marginBottom: "0.2rem" }}>
            Welcome back, {displayName}
          </h1>
          {user?.email && (
            <p className="gaia-note" style={{ marginTop: 0 }}>
              {user.email}
            </p>
          )}
          <p style={{ marginTop: "0.75rem" }}>
            Your personal wellness dashboard. View your saved paths, manage
            reminders, and search for new guidance whenever you need it.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Botanical support</span>
            <span className="gaia-chip">Condition-matched</span>
            <span className="gaia-chip">Safety-forward</span>
          </div>
        </header>

        {/* ── Data loading / error ── */}
        {dash.loading && (
          <article className="gaia-card gaia-surface-muted gaia-loading-card">
            <p>Loading your saved paths and reminders...</p>
          </article>
        )}

        {dash.error && !dash.loading && (
          <article className="gaia-card">
            <p className="gaia-error">{dash.error}</p>
            <p className="gaia-note">
              Saved paths and reminders require the backend to be running.
            </p>
          </article>
        )}

        {!dash.loading && (
          <>
            {/* ── Your Saved Wellness Paths ── */}
            <article className="gaia-card">
              <div className="gaia-section-title">
                <h2>Your Saved Wellness Paths</h2>
                <span className={`gaia-section-kicker${dash.plans.length > 0 ? " status-badge--active" : " status-badge--empty"}`}>
                  {dash.plans.length > 0 ? `${dash.plans.length} saved` : "None saved"}
                </span>
              </div>

              {dash.plans.length > 0 ? (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  {dash.plans.map((plan) => (
                    <li key={plan.planID} style={listItemStyle}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 500 }}>{plan.title}</p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.4rem",
                          flexShrink: 0,
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {plan.conditionID ? (
                          <Link
                            href={`/results?id=${plan.conditionID}&saved=1`}
                            className="gaia-btn gaia-btn-secondary"
                            style={smallBtnStyle}
                          >
                            View
                          </Link>
                        ) : null}

                        {confirmDeletePlan === plan.planID ? (
                          <>
                            <span
                              className="gaia-note"
                              style={{ fontSize: "0.8rem", fontStyle: "normal", alignSelf: "center" }}
                            >
                              Remove this path?
                            </span>
                            <button
                              type="button"
                              className="gaia-btn gaia-btn-primary"
                              style={smallBtnStyle}
                              onClick={() => handleDeletePlan(plan.planID)}
                            >
                              Yes, remove
                            </button>
                            <button
                              type="button"
                              className="gaia-btn gaia-btn-ghost"
                              style={smallBtnStyle}
                              onClick={() => setConfirmDeletePlan(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="gaia-btn gaia-btn-ghost"
                            style={smallBtnStyle}
                            onClick={() => setConfirmDeletePlan(plan.planID)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="gaia-note">
                  Your saved paths will appear here. Search for a condition below to get started.
                </p>
              )}

              <div className="gaia-actions" style={{ marginTop: "0.75rem" }}>
                <Link href="/search" className={`gaia-btn ${dash.plans.length > 0 ? "gaia-btn-secondary" : "gaia-btn-primary"}`}>
                  {dash.plans.length > 0 ? "Search another condition" : "Search for a condition"}
                </Link>
              </div>
            </article>

            {/* ── Reminders ── */}
            <article className="gaia-card">
              <div className="gaia-section-title">
                <h2>Your Reminders</h2>
                <span className={`gaia-section-kicker${dash.reminders.length > 0 ? " status-badge--active" : " status-badge--empty"}`}>
                  {dash.reminders.length > 0
                    ? `${dash.reminders.length} set`
                    : "None set"}
                </span>
              </div>

              {dash.reminders.length > 0 ? (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  {dash.reminders.map((rem) => (
                    <li key={rem.reminderID} style={listItemStyle}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>
                          {rem.label}
                        </p>
                        <p
                          className="gaia-note"
                          style={{ margin: "0.15rem 0 0" }}
                        >
                          {formatTime(rem.remindTime)}
                          {rem.dayOfWeek ? ` · ${rem.dayOfWeek}` : ""}
                          {rem.planTitle ? ` · ${rem.planTitle}` : ""}
                        </p>
                        {!rem.enabled && (
                          <span
                            className="gaia-chip"
                            style={{ marginTop: "0.3rem", display: "inline-block" }}
                          >
                            Disabled
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.4rem",
                          flexShrink: 0,
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {confirmDeleteReminder === rem.reminderID ? (
                          <>
                            <span
                              className="gaia-note"
                              style={{ fontSize: "0.8rem", fontStyle: "normal", alignSelf: "center" }}
                            >
                              Remove?
                            </span>
                            <button
                              type="button"
                              className="gaia-btn gaia-btn-primary"
                              style={smallBtnStyle}
                              onClick={() => handleDeleteReminder(rem.reminderID)}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              className="gaia-btn gaia-btn-ghost"
                              style={smallBtnStyle}
                              onClick={() => setConfirmDeleteReminder(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="gaia-btn gaia-btn-ghost"
                            style={smallBtnStyle}
                            onClick={() => setConfirmDeleteReminder(rem.reminderID)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="gaia-note">
                  No reminders yet. Daily reminders help you stay consistent — save a wellness path first, then add one here.
                </p>
              )}

              {/* Notification permission nudge — shown when reminders exist but permission not yet granted */}
              {dash.reminders.length > 0 && notifPermission !== "granted" && notifPermission !== "denied" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.55rem 0.8rem",
                    borderRadius: "0.6rem",
                    background: "rgba(124,156,255,0.06)",
                    border: "1px solid rgba(124,156,255,0.14)",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--gaia-ink-700)", flex: 1 }}>
                    Enable browser notifications to receive reminder alerts.
                  </span>
                  <button
                    type="button"
                    className="gaia-btn gaia-btn-secondary"
                    style={{ fontSize: "0.74rem", padding: "0.22rem 0.65rem", flexShrink: 0 }}
                    onClick={requestNotifPermission}
                  >
                    Enable
                  </button>
                </div>
              )}
              {dash.reminders.length > 0 && notifPermission === "denied" && (
                <p className="gaia-note" style={{ fontSize: "0.76rem" }}>
                  Browser notifications are blocked. In-app alerts will still appear when this page is open.
                </p>
              )}

              <hr className="gaia-divider" style={{ margin: "1rem 0 0.75rem" }} />

              {/* Add reminder */}
              {!form.open && activePlan && (
                <div className="gaia-actions">
                  <button
                    type="button"
                    className="gaia-btn gaia-btn-secondary"
                    onClick={() => openReminderForm(activePlan)}
                  >
                    Add Reminder
                  </button>
                </div>
              )}

              {!form.open && !activePlan && (
                <p className="gaia-note">
                  Save a wellness path first to unlock reminders.{" "}
                  <Link href="/search">Find your path →</Link>
                </p>
              )}

              {form.open && (
                <form
                  className="gaia-form-card"
                  onSubmit={handleAddReminder}
                >
                  <label htmlFor="dash-reminder-label">Reminder label</label>
                  <input
                    id="dash-reminder-label"
                    className="gaia-input"
                    type="text"
                    value={form.label}
                    onChange={(e) =>
                      setForm({ ...form, label: e.target.value })
                    }
                    placeholder="e.g. Morning wellness check"
                  />

                  <label htmlFor="dash-reminder-time">Time</label>
                  <input
                    id="dash-reminder-time"
                    className="gaia-input"
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="gaia-btn gaia-btn-ghost"
                    style={{ fontSize: "0.76rem", padding: "0.22rem 0.65rem", justifySelf: "start" }}
                    onClick={setOneMinFromNow}
                  >
                    Quick demo — 1 min from now
                  </button>

                  <label htmlFor="dash-reminder-day">Repeat</label>
                  <select
                    id="dash-reminder-day"
                    className="gaia-input"
                    value={form.day}
                    onChange={(e) =>
                      setForm({ ...form, day: e.target.value })
                    }
                  >
                    <option value="Daily">Daily</option>
                    <option value="Mon-Fri">Weekdays (Mon–Fri)</option>
                    <option value="Weekends">Weekends (Sat–Sun)</option>
                    <option value="Monday">Monday only</option>
                    <option value="Tuesday">Tuesday only</option>
                    <option value="Wednesday">Wednesday only</option>
                    <option value="Thursday">Thursday only</option>
                    <option value="Friday">Friday only</option>
                  </select>

                  {form.error && (
                    <p className="gaia-error">{form.error}</p>
                  )}

                  <div className="gaia-actions">
                    <button
                      type="submit"
                      className="gaia-btn gaia-btn-primary"
                      disabled={form.saving}
                    >
                      {form.saving ? "Saving..." : "Set Reminder"}
                    </button>
                    <button
                      type="button"
                      className="gaia-btn gaia-btn-ghost"
                      onClick={() => setForm({ open: false })}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </article>

          </>
        )}

        {/* ── Quick Actions ── */}
        <section className="gaia-grid gaia-grid-3" aria-label="Quick actions">
          <article className="gaia-card gaia-action-primary">
            <div className="gaia-section-title">
              <h2>Search a Condition</h2>
              <span className="gaia-section-kicker">Start here</span>
            </div>
            <p>
              Enter your diagnosed condition to open a supportive, nature-led
              guidance path.
            </p>
            <div className="gaia-actions">
              <Link href="/search" className="gaia-btn gaia-btn-primary">
                Go to search
              </Link>
            </div>
          </article>

          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>Your Wellness Path</h2>
              <span className={`gaia-section-kicker${activePlan ? " status-badge--active" : " status-badge--empty"}`}>
                {activePlan ? "Saved" : "Not saved"}
              </span>
            </div>
            <p>
              {activePlan
                ? `Currently: ${activePlan.title}`
                : "Search for a diagnosed condition to find and save your first wellness path."}
            </p>
            <div className="gaia-actions">
              {activePlan?.conditionID ? (
                <Link
                  href={`/results?id=${activePlan.conditionID}&saved=1`}
                  className="gaia-btn gaia-btn-secondary"
                >
                  View path
                </Link>
              ) : (
                <Link href="/search" className="gaia-btn gaia-btn-secondary">
                  Find a path
                </Link>
              )}
            </div>
          </article>

          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>G.A.I.A. Overview</h2>
              <span className="gaia-section-kicker">About this app</span>
            </div>
            <p>
              Review what G.A.I.A. offers and how it complements your
              professional care.
            </p>
            <div className="gaia-actions">
              <Link href="/overview" className="gaia-btn gaia-btn-ghost">
                View overview
              </Link>
            </div>
          </article>
        </section>

        {/* ── Safety disclaimer ── */}
        <article className="gaia-card gaia-disclaimer">
          <strong>Medical safety note:</strong> G.A.I.A. offers supportive
          wellness content only. It does not diagnose, treat, cure, or replace
          professional medical care. Always consult a qualified healthcare
          professional before changing your routine.
        </article>

      </section>
    </main>
  );
}

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

  const [confirmDeletePlan, setConfirmDeletePlan] = useState<number | null>(null);
  const [confirmDeleteReminder, setConfirmDeleteReminder] = useState<number | null>(null);

  // ✅ FIXED (no useEffect anymore)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

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
        if (!cancelled) {
          setDash({ plans, reminders, loading: false, error: null });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDash((d) => ({
            ...d,
            loading: false,
            error: "Could not load dashboard data. Make sure the backend is running.",
          }));
        }
      });

    return () => {
      cancelled = true;
    };
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
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
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

  return (
    <main className="gaia-page">
      <section className="gaia-shell">
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Your Dashboard</p>
          <h1>Welcome back, {displayName}</h1>
          {user?.email && <p className="gaia-note">{user.email}</p>}
        </header>
      </section>
    </main>
  );
}
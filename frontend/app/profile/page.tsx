"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  fetchUserPlans,
  fetchUserReminders,
  deleteReminder,
  createReminder,
  type UserPlan,
  type UserReminder,
} from "@/lib/api";

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
    setDash((d) => ({ ...d, loading: true, error: null }));

    Promise.all([fetchUserPlans(userID), fetchUserReminders(userID)])
      .then(([plans, reminders]) => {
        setDash({ plans, reminders, loading: false, error: null });
      })
      .catch(() => {
        setDash((d) => ({
          ...d,
          loading: false,
          error:
            "Could not load dashboard data. Make sure the backend is running.",
        }));
      });
  }, [userID]);

  if (status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Loading your dashboard...</h2>
            <p>Checking your session.</p>
          </article>
        </section>
      </main>
    );
  }

  if (!session?.user) return null;

  const activePlan: UserPlan | null = dash.plans[0] ?? null;

  async function handleLogout() {
    await signOut({ callbackUrl: "/entry" });
  }

  async function handleDeleteReminder(reminderID: number) {
    const result = await deleteReminder(reminderID);
    if (result.ok) {
      setDash((d) => ({
        ...d,
        reminders: d.reminders.filter((r) => r.reminderID !== reminderID),
      }));
    }
  }

  function openReminderForm(plan: UserPlan) {
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

  const hasActivity = dash.plans.length > 0 || dash.reminders.length > 0;

  return (
    <main className="gaia-page">
      <section className="gaia-shell">

        {/* ── Header with logout ── */}
        <header className="gaia-header-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            <div>
              <p className="gaia-kicker">Your Dashboard</p>
              <h1 style={{ marginBottom: "0.2rem" }}>
                Welcome back, {displayName}
              </h1>
              {user?.email && (
                <p className="gaia-note" style={{ marginTop: 0 }}>
                  {user.email}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="gaia-btn gaia-btn-ghost"
              style={{ flexShrink: 0, marginTop: "0.2rem" }}
            >
              Log out
            </button>
          </div>
          <p style={{ marginTop: "0.75rem" }}>
            Your personal wellness dashboard. View your saved condition path,
            manage reminders, and search for new guidance whenever you need it.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Botanical support</span>
            <span className="gaia-chip">Condition-matched</span>
            <span className="gaia-chip">Safety-forward</span>
          </div>
        </header>

        {/* ── Data loading / error ── */}
        {dash.loading && (
          <article className="gaia-card gaia-surface-muted">
            <p>Loading your plans and reminders...</p>
          </article>
        )}

        {dash.error && !dash.loading && (
          <article className="gaia-card">
            <p className="gaia-error">{dash.error}</p>
            <p className="gaia-note">
              Plans and reminders require the backend to be running.
            </p>
          </article>
        )}

        {!dash.loading && (
          <>
            {/* ── Your Wellness Path ── */}
            <article className="gaia-card">
              <div className="gaia-section-title">
                <h2>Your Wellness Path</h2>
                <span className="gaia-section-kicker">
                  {activePlan ? "Active" : "Not started"}
                </span>
              </div>

              {activePlan ? (
                <>
                  <p>
                    <strong>{activePlan.title}</strong>
                  </p>
                  {dash.plans.length > 1 && (
                    <p className="gaia-note">
                      {dash.plans.length} saved plans total.
                    </p>
                  )}
                  <div className="gaia-actions">
                    {activePlan.conditionID ? (
                      <Link
                        href={`/results?id=${activePlan.conditionID}`}
                        className="gaia-btn gaia-btn-primary"
                      >
                        View full plan
                      </Link>
                    ) : (
                      <Link
                        href="/search"
                        className="gaia-btn gaia-btn-primary"
                      >
                        View full plan
                      </Link>
                    )}
                    <Link
                      href="/search"
                      className="gaia-btn gaia-btn-secondary"
                    >
                      Search another condition
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p>You do not have a saved wellness path yet.</p>
                  <p className="gaia-note">
                    Search for your diagnosed condition to get started.
                  </p>
                  <div className="gaia-actions">
                    <Link href="/search" className="gaia-btn gaia-btn-primary">
                      Search for a condition
                    </Link>
                  </div>
                </>
              )}
            </article>

            {/* ── Reminders ── */}
            <article className="gaia-card">
              <div className="gaia-section-title">
                <h2>Your Reminders</h2>
                <span className="gaia-section-kicker">
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
                    <li
                      key={rem.reminderID}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                        padding: "0.7rem 0.85rem",
                        borderRadius: "0.5rem",
                        background: "var(--gaia-surface, rgba(0,0,0,0.03))",
                        border: "1px solid var(--gaia-border, rgba(0,0,0,0.07))",
                      }}
                    >
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
                      <button
                        type="button"
                        className="gaia-btn gaia-btn-ghost"
                        style={{ fontSize: "0.78rem", padding: "0.25rem 0.6rem", flexShrink: 0 }}
                        onClick={() => handleDeleteReminder(rem.reminderID)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="gaia-note">No reminders set yet.</p>
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
                  Save a wellness plan first to add reminders.{" "}
                  <Link href="/search">Search for a condition →</Link>
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

            {/* ── Recent Activity ── */}
            <article className="gaia-card gaia-surface-muted">
              <div className="gaia-section-title">
                <h2>Recent Activity</h2>
                <span className="gaia-section-kicker">Your history</span>
              </div>
              {!hasActivity ? (
                <p className="gaia-note">
                  No activity yet. Start by searching for a condition.
                </p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  {dash.reminders.map((rem) => (
                    <li key={`rem-${rem.reminderID}`} className="gaia-note">
                      Reminder set:{" "}
                      <strong>{rem.label}</strong>
                      {rem.planTitle ? ` (${rem.planTitle})` : ""}
                    </li>
                  ))}
                  {dash.plans.map((plan) => (
                    <li key={`plan-${plan.planID}`} className="gaia-note">
                      Wellness plan saved: <strong>{plan.title}</strong>
                    </li>
                  ))}
                </ul>
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
              <span className="gaia-section-kicker">
                {activePlan ? "Saved" : "Not saved"}
              </span>
            </div>
            <p>
              {activePlan
                ? `Currently: ${activePlan.title}`
                : "No saved plan yet. Search to find your path."}
            </p>
            <div className="gaia-actions">
              {activePlan?.conditionID ? (
                <Link
                  href={`/results?id=${activePlan.conditionID}`}
                  className="gaia-btn gaia-btn-secondary"
                >
                  View plan
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

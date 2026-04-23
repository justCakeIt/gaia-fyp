"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  savePlan,
  createReminder,
  type BackendRecommendations,
  type PlanItem,
  type UserPlan,
} from "@/lib/api";

type Phase =
  | { name: "idle" }
  | { name: "duplicate_confirm" }
  | { name: "saving" }
  | { name: "saved"; planID: number }
  | { name: "reminder_form"; planID: number }
  | { name: "setting_reminder"; planID: number }
  | { name: "reminder_done"; planID: number; reminderID: number }
  | { name: "error"; message: string };

type Props = {
  sessionStatus: "authenticated" | "unauthenticated" | "loading";
  userID: number | null;
  backend: BackendRecommendations | null;
  conditionTitle: string;
  userPlans: UserPlan[];
};

export default function PlanSaveSection({
  sessionStatus,
  userID,
  backend,
  conditionTitle,
  userPlans,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ name: "idle" });

  useEffect(() => {
    if (phase.name === "reminder_done") {
      const t = setTimeout(() => router.push("/profile"), 1400);
      return () => clearTimeout(t);
    }
  }, [phase.name, router]);

  const [reminderLabel, setReminderLabel] = useState(
    `${conditionTitle} — daily check-in`
  );
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderDay, setReminderDay] = useState("Daily");

  // Guest: show login/register prompt
  if (sessionStatus === "unauthenticated") {
    return (
      <article className="gaia-card gaia-surface-muted">
        <div className="gaia-section-title">
          <h2>Save This Plan</h2>
          <span className="gaia-section-kicker">Members only</span>
        </div>
        <p>
          Log in or create a free account to save this wellness plan and set
          daily reminders.
        </p>
        <div className="gaia-actions">
          <Link href="/entry?mode=login" className="gaia-btn gaia-btn-primary">
            Log In to Save
          </Link>
          <Link href="/entry?mode=register" className="gaia-btn gaia-btn-secondary">
            Create Account
          </Link>
        </div>
      </article>
    );
  }

  // Can only save if we have backend data (need real DB IDs for plan items)
  if (!backend) {
    return (
      <article className="gaia-card gaia-surface-muted">
        <div className="gaia-section-title">
          <h2>Save This Plan</h2>
          <span className="gaia-section-kicker">Unavailable</span>
        </div>
        <p className="gaia-note">
          Plan saving requires a connection to the Gaia backend. Start a search
          from the search page to load a fully connected plan.
        </p>
        <div className="gaia-actions">
          <Link href="/search" className="gaia-btn gaia-btn-secondary">
            Go to search
          </Link>
        </div>
      </article>
    );
  }

  // Core save logic — called directly once duplicates are handled
  async function executeSave() {
    if (!userID || !backend) return;
    setPhase({ name: "saving" });

    // Build items from backend recommendations — exclude "avoid" herbs
    const items: PlanItem[] = [];

    for (const herb of backend.herbs) {
      if (herb.recommendationLevel !== "avoid") {
        items.push({ itemType: "herb", herbID: herb.herbID });
      }
    }
    for (const recipe of backend.recipes) {
      items.push({ itemType: "recipe", recipeID: recipe.recipeID });
    }
    for (const mixture of backend.mixtures) {
      items.push({ itemType: "mixture", mixtureID: mixture.mixtureID });
    }

    if (items.length === 0) {
      setPhase({ name: "error", message: "No plan items found for this condition." });
      return;
    }

    const result = await savePlan({
      userID,
      conditionID: backend.condition.conditionID,
      title: `${conditionTitle} Plan`,
      items,
    });

    if (!result.ok) {
      setPhase({ name: "error", message: result.error });
      return;
    }

    setPhase({ name: "saved", planID: result.planID });
  }

  async function handleSave() {
    if (!userID || !backend) return;

    // Check for an existing saved plan with the same conditionID
    const hasDuplicate = userPlans.some(
      (p) => p.conditionID !== null && p.conditionID === backend.condition.conditionID
    );
    if (hasDuplicate) {
      setPhase({ name: "duplicate_confirm" });
      return;
    }

    await executeSave();
  }

  async function handleSetReminder(
    event: FormEvent<HTMLFormElement>,
    planID: number
  ) {
    event.preventDefault();
    if (!userID) return;

    if (!reminderLabel.trim()) {
      setPhase({ name: "error", message: "Reminder label cannot be empty." });
      return;
    }

    setPhase({ name: "setting_reminder", planID });

    const result = await createReminder({
      userID,
      planID,
      label: reminderLabel.trim(),
      remindTime: reminderTime || null,
      dayOfWeek: reminderDay || null,
    });

    if (!result.ok) {
      setPhase({ name: "error", message: result.error });
      return;
    }

    setPhase({ name: "reminder_done", planID, reminderID: result.reminderID });
  }

  if (phase.name === "idle") {
    return (
      <article className="gaia-card gaia-surface-muted">
        <div className="gaia-section-title">
          <h2>Save This Plan</h2>
          <span className="gaia-section-kicker">Your account</span>
        </div>
        <p>
          Save this wellness plan to your account so you can return to it
          anytime and set daily reminders.
        </p>
        <div className="gaia-actions">
          <button
            type="button"
            className="gaia-btn gaia-btn-primary"
            onClick={handleSave}
          >
            Save Plan
          </button>
        </div>
      </article>
    );
  }

  if (phase.name === "duplicate_confirm") {
    return (
      <article className="gaia-card gaia-surface-muted">
        <div className="gaia-section-title">
          <h2>Already Saved</h2>
          <span className="gaia-section-kicker">Duplicate detected</span>
        </div>
        <p>
          You already have this wellness path saved. Would you like to save
          another copy anyway?
        </p>
        <div className="gaia-actions">
          <button
            type="button"
            className="gaia-btn gaia-btn-primary"
            onClick={executeSave}
          >
            Yes, save another copy
          </button>
          <button
            type="button"
            className="gaia-btn gaia-btn-ghost"
            onClick={() => setPhase({ name: "idle" })}
          >
            No, cancel
          </button>
        </div>
      </article>
    );
  }

  if (phase.name === "saving") {
    return (
      <article className="gaia-card gaia-surface-muted">
        <h2>Saving your plan...</h2>
        <p>Please wait.</p>
      </article>
    );
  }

  if (phase.name === "saved") {
    return (
      <article className="gaia-card">
        <div className="gaia-section-title">
          <h2>Plan Saved</h2>
          <span className="gaia-section-kicker">Your account</span>
        </div>
        <p>
          Your wellness plan has been saved. Would you like to add a daily
          reminder to help you stay on track?
        </p>
        <div className="gaia-actions">
          <button
            type="button"
            className="gaia-btn gaia-btn-primary"
            onClick={() => setPhase({ name: "reminder_form", planID: phase.planID })}
          >
            Add a Reminder
          </button>
          <button
            type="button"
            className="gaia-btn gaia-btn-ghost"
            onClick={() => setPhase({ name: "reminder_done", planID: phase.planID, reminderID: 0 })}
          >
            No Thanks
          </button>
        </div>
      </article>
    );
  }

  if (phase.name === "reminder_form") {
    return (
      <article className="gaia-card">
        <div className="gaia-section-title">
          <h2>Set a Reminder</h2>
          <span className="gaia-section-kicker">Optional</span>
        </div>
        <form
          className="gaia-form-card"
          onSubmit={(e) => handleSetReminder(e, phase.planID)}
        >
          <label htmlFor="reminder-label">Reminder label</label>
          <input
            id="reminder-label"
            className="gaia-input"
            type="text"
            value={reminderLabel}
            onChange={(e) => setReminderLabel(e.target.value)}
            placeholder="e.g. Morning wellness check"
          />

          <label htmlFor="reminder-time">Time</label>
          <input
            id="reminder-time"
            className="gaia-input"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />

          <label htmlFor="reminder-day">Repeat</label>
          <select
            id="reminder-day"
            className="gaia-input"
            value={reminderDay}
            onChange={(e) => setReminderDay(e.target.value)}
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

          <div className="gaia-actions">
            <button
              type="submit"
              className="gaia-btn gaia-btn-primary"
            >
              Set Reminder
            </button>
            <button
              type="button"
              className="gaia-btn gaia-btn-ghost"
              onClick={() =>
                setPhase({ name: "reminder_done", planID: phase.planID, reminderID: 0 })
              }
            >
              Skip
            </button>
          </div>
        </form>
      </article>
    );
  }

  if (phase.name === "setting_reminder") {
    return (
      <article className="gaia-card">
        <h2>Setting reminder...</h2>
        <p>Please wait.</p>
      </article>
    );
  }

  if (phase.name === "reminder_done") {
    return (
      <article className="gaia-card">
        <div className="gaia-section-title">
          <h2>{phase.reminderID ? "All set!" : "Plan saved"}</h2>
          <span className="gaia-section-kicker">Redirecting…</span>
        </div>
        <p>
          {phase.reminderID
            ? "Your wellness plan is saved and your reminder is active."
            : "Your wellness plan has been saved to your account."}
        </p>
        <p className="gaia-note" style={{ marginTop: "0.5rem" }}>
          Taking you to your profile…
        </p>
      </article>
    );
  }

  if (phase.name === "error") {
    return (
      <article className="gaia-card">
        <div className="gaia-section-title">
          <h2>Something went wrong</h2>
          <span className="gaia-section-kicker">Error</span>
        </div>
        <p className="gaia-error">{phase.message}</p>
        <div className="gaia-actions">
          <button
            type="button"
            className="gaia-btn gaia-btn-ghost"
            onClick={() => setPhase({ name: "idle" })}
          >
            Try Again
          </button>
        </div>
      </article>
    );
  }

  return null;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  savePlan,
  createReminder,
  type BackendRecommendations,
  type UserPlan,
} from "@/lib/api";
import Dialog from "@/components/Dialog";
import Link from "next/link";

type Phase =
  | { name: "idle" }
  | { name: "duplicate_confirm" }
  | { name: "saving" }
  | { name: "saved_confirm"; planID: number }
  | {
      name: "reminder";
      planID: number;
      label: string;
      time: string;
      day: string;
      saving: boolean;
      error: string;
    }
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

  if (!backend) {
    return (
      <article className="gaia-card gaia-surface-muted">
        <div className="gaia-section-title">
          <h2>Save This Plan</h2>
        </div>
        <p className="gaia-note">
          This becomes available after finding a condition through the guided search flow.
        </p>
      </article>
    );
  }

  async function executeSave() {
    if (!userID || !backend) return;
    setPhase({ name: "saving" });

    const items: any[] = [];

    for (const herb of backend.herbs ?? []) {
      if (herb.recommendationLevel !== "avoid") {
        items.push({ itemType: "herb", herbID: herb.herbID });
      }
    }

    for (const recipe of backend.recipes ?? []) {
      items.push({ itemType: "recipe", recipeID: recipe.recipeID });
    }

    for (const mixture of backend.mixtures ?? []) {
      items.push({ itemType: "mixture", mixtureID: mixture.mixtureID });
    }

    if (items.length === 0) {
      setPhase({ name: "error", message: "No plan items found." });
      return;
    }

    const result = await savePlan({
      userID,
      conditionID: backend.condition.conditionID,
      title: `${conditionTitle} Plan`,
      items,
    });

    if (!result || !result.ok || !result.planID) {
      setPhase({
        name: "error",
        message: result?.error || "Failed to save plan.",
      });
      return;
    }

    setPhase({ name: "saved_confirm", planID: result.planID });
  }

  async function handleSave() {
    if (!userID || !backend) return;

    const duplicate = userPlans.some(
      (p) => p.conditionID === backend.condition.conditionID
    );

    if (duplicate) {
      setPhase({ name: "duplicate_confirm" });
      return;
    }

    await executeSave();
  }

  function openReminderForm(planID: number) {
    setPhase({
      name: "reminder",
      planID,
      label: `${conditionTitle} Plan — daily check-in`,
      time: "08:00",
      day: "Daily",
      saving: false,
      error: "",
    });
  }

  function setOneMinFromNow() {
    if (phase.name !== "reminder") return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setPhase({ ...phase, time: `${hh}:${mm}` });
  }

  async function handleSetReminder(e: { preventDefault(): void }) {
    e.preventDefault();
    if (phase.name !== "reminder" || !userID) return;

    if (!phase.label.trim()) {
      setPhase({ ...phase, error: "Reminder label cannot be empty." });
      return;
    }

    setPhase({ ...phase, saving: true, error: "" });

    const result = await createReminder({
      userID,
      planID: phase.planID,
      label: phase.label.trim(),
      remindTime: phase.time || null,
      dayOfWeek: phase.day || null,
    });

    if (!result.ok) {
      setPhase({ ...phase, saving: false, error: result.error });
      return;
    }

    router.push("/profile");
  }

  if (phase.name === "idle") {
    return (
      <article className="gaia-card gaia-surface-muted" style={{ marginTop: "2rem" }}>
        <div className="gaia-section-title">
          <h2>Save This Plan</h2>
        </div>
        <p className="gaia-note">
          Save your personalised wellness path to your profile and optionally set a daily reminder to stay consistent.
        </p>
        <div className="gaia-actions" style={{ marginTop: "0.25rem" }}>
          <button className="gaia-btn gaia-btn-primary" onClick={handleSave}>
            Save Plan
          </button>
        </div>
      </article>
    );
  }

  if (phase.name === "duplicate_confirm") {
    return (
      <Dialog
        open
        title="Plan already exists"
        message="You already have this plan. Save another copy?"
        onConfirm={executeSave}
        onCancel={() => router.push("/profile")}
        confirmText="Yes"
        cancelText="No"
      />
    );
  }

  if (phase.name === "saving") {
    return (
      <article className="gaia-card gaia-surface-muted gaia-loading-card" style={{ marginTop: "2rem" }}>
        <p className="gaia-note">Saving your plan...</p>
      </article>
    );
  }

  if (phase.name === "saved_confirm") {
    return (
      <Dialog
        open
        title="Plan saved"
        message="Would you like to set up a reminder?"
        onConfirm={() => openReminderForm(phase.planID)}
        onCancel={() => router.push("/profile")}
        confirmText="Yes"
        cancelText="No"
      />
    );
  }

  if (phase.name === "reminder") {
    return (
      <article className="gaia-card" style={{ marginTop: "2rem" }}>
        <div className="gaia-section-title">
          <h2>Set a Reminder</h2>
          <span className="gaia-section-kicker status-badge--active">Plan saved</span>
        </div>
        <p className="gaia-note">
          Set a daily reminder to stay consistent with your wellness path, or skip to your profile now.
        </p>

        <form className="gaia-form-card" onSubmit={handleSetReminder}>
          <label htmlFor="save-reminder-label">Reminder label</label>
          <input
            id="save-reminder-label"
            className="gaia-input"
            type="text"
            value={phase.label}
            onChange={(e) => setPhase({ ...phase, label: e.target.value })}
            placeholder="e.g. Morning wellness check"
          />

          <label htmlFor="save-reminder-time">Time</label>
          <input
            id="save-reminder-time"
            className="gaia-input"
            type="time"
            value={phase.time}
            onChange={(e) => setPhase({ ...phase, time: e.target.value })}
          />
          <button
            type="button"
            className="gaia-btn gaia-btn-ghost"
            style={{ fontSize: "0.76rem", padding: "0.22rem 0.65rem", justifySelf: "start" }}
            onClick={setOneMinFromNow}
          >
            Quick demo — 1 min from now
          </button>

          <label htmlFor="save-reminder-day">Repeat</label>
          <select
            id="save-reminder-day"
            className="gaia-input"
            value={phase.day}
            onChange={(e) => setPhase({ ...phase, day: e.target.value })}
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

          {phase.error && <p className="gaia-error">{phase.error}</p>}

          <div className="gaia-actions">
            <button
              type="submit"
              className="gaia-btn gaia-btn-primary"
              disabled={phase.saving}
            >
              {phase.saving ? "Saving..." : "Set Reminder"}
            </button>
            <button
              type="button"
              className="gaia-btn gaia-btn-ghost"
              onClick={() => router.push("/profile")}
            >
              Skip
            </button>
          </div>
        </form>
      </article>
    );
  }

  if (phase.name === "error") {
    return (
      <article className="gaia-card" style={{ marginTop: "2rem" }}>
        <p className="gaia-error">{phase.message}</p>
        <div className="gaia-actions">
          <button
            className="gaia-btn gaia-btn-ghost"
            onClick={() => setPhase({ name: "idle" })}
          >
            Try again
          </button>
        </div>
      </article>
    );
  }

  return null;
}
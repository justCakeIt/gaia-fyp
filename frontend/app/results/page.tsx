"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { findConditionById } from "@/lib/conditions";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const conditionId = searchParams.get("id") ?? "";

  const content = useMemo(() => findConditionById(conditionId), [conditionId]);

  useEffect(() => {
    if (status !== "unauthenticated" && status !== "loading" && (!conditionId || !content)) {
      router.replace("/search");
    }
  }, [conditionId, content, router, status]);

  if (status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Loading your support plan…</h2>
            <p>Checking your session before opening condition guidance.</p>
          </article>
        </section>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card gaia-surface-muted">
            <div className="gaia-section-title">
              <h2>Registered Access Required</h2>
              <span className="gaia-section-kicker">Members only</span>
            </div>
            <p>
              Full detailed support plans are available to logged-in members.
              Guests can explore a curated preview experience.
            </p>
            <div className="gaia-actions">
              <Link href="/overview?mode=guest&preview=1#guest-preview" className="gaia-btn gaia-btn-secondary">
                Guest Preview
              </Link>
              <Link href="/entry" className="gaia-btn gaia-btn-primary">
                Log In or Register
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Redirecting…</h2>
            <p>No valid condition selected. Returning to search.</p>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="gaia-page">
      <section className="gaia-shell gaia-results-shell">

        {/* Header */}
        <header className="gaia-header-card">
          <p className="gaia-kicker">Support Plan</p>
          <h1>{content.title}</h1>
          <p>{content.supportiveOverview}</p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Hydration</span>
            <span className="gaia-chip">Nutrition</span>
            <span className="gaia-chip">Lifestyle</span>
            <span className="gaia-chip">Botanical support</span>
          </div>
        </header>

        {/* Disclaimer — always first after header */}
        <article className="gaia-card gaia-disclaimer">
          <p>
            <strong>Medical disclaimer —</strong> {content.disclaimer}
          </p>
        </article>

        {/* ── 1. Botanical Elixir ── */}
        <article className="gaia-card gaia-elixir-card">
          <div className="gaia-results-heading">
            <span className="gaia-section-badge gaia-elixir-badge" aria-hidden>1</span>
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>{content.elixir.name}</h2>
              <span className="gaia-section-kicker">Botanical elixir</span>
            </div>
          </div>
          <p>{content.elixir.purpose}</p>
          <hr className="gaia-divider" />

          <div className="gaia-elixir-grid">
            <div>
              <h3>Ingredients</h3>
              <ul>
                {content.elixir.ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Method</h3>
              <ol>
                {content.elixir.method.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="gaia-list-card">
            <p className="gaia-section-kicker" style={{ marginBottom: "0.5rem" }}>Safety notes</p>
            <ul>
              {content.elixir.safetyNotes.map((note) => (
                <li key={note} className="gaia-note">{note}</li>
              ))}
            </ul>
          </div>
        </article>

        {/* ── 2. Diet Approach ── */}
        <article className="gaia-card">
          <div className="gaia-results-heading">
            <span className="gaia-section-badge" aria-hidden>2</span>
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>{content.dietApproach.name}</h2>
              <span className="gaia-section-kicker">Nutrition</span>
            </div>
          </div>
          <p>{content.dietApproach.summary}</p>
          <hr className="gaia-divider" />
          <ul>
            {content.dietApproach.principles.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </article>

        {/* ── 3. One-Day Meal Plan ── */}
        <article className="gaia-card gaia-surface-muted">
          <div className="gaia-results-heading">
            <span className="gaia-section-badge" aria-hidden>3</span>
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>One-Day Meal Plan</h2>
              <span className="gaia-section-kicker">Breakfast · Lunch · Dinner</span>
            </div>
          </div>
          <p className="gaia-note">
            A sample day shaped around liver-supportive eating principles.
            Adjust portions and ingredients to your own preferences and tolerance.
          </p>
          <div className="gaia-meals-grid">
            {content.oneDayPlan.map((meal) => (
              <div key={meal.label} className="gaia-meal">
                <div className="gaia-section-title" style={{ marginBottom: "0.45rem" }}>
                  <h3>{meal.label}</h3>
                  <span className="gaia-section-kicker">Supportive</span>
                </div>
                <p>{meal.meal}</p>
                <p className="gaia-note" style={{ marginTop: "0.45rem" }}>{meal.notes}</p>
              </div>
            ))}
          </div>
        </article>

        {/* ── 4. Lifestyle Support ── */}
        <article className="gaia-card">
          <div className="gaia-results-heading">
            <span className="gaia-section-badge" aria-hidden>4</span>
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>Lifestyle Support</h2>
              <span className="gaia-section-kicker">Daily rhythm</span>
            </div>
          </div>
          <p className="gaia-note">
            Small, consistent habits often create more lasting change than
            intensive short-term efforts.
          </p>
          <ul>
            {content.lifestyleTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>

        {/* ── 5. Precautions ── */}
        <article className="gaia-card gaia-precautions-card">
          <div className="gaia-results-heading">
            <span className="gaia-section-badge" aria-hidden>5</span>
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>Precautions &amp; When to See a Doctor</h2>
              <span className="gaia-section-kicker">Safety first</span>
            </div>
          </div>
          <ul>
            {content.precautions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        {/* ── Navigation ── */}
        <div className="gaia-results-nav">
          <Link href="/search" className="gaia-btn gaia-btn-primary">
            Search another condition
          </Link>
          <Link href="/profile" className="gaia-btn gaia-btn-secondary">
            Back to profile
          </Link>
        </div>

      </section>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="gaia-page">
          <section className="gaia-shell">
            <article className="gaia-card">
              <h2>Loading support plan…</h2>
              <p>Fetching your condition-specific wellness guidance.</p>
            </article>
          </section>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

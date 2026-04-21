"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { findConditionById, findConditionByQuery, type ConditionContent } from "@/lib/conditions";
import { getRecommendations, type BackendRecommendations } from "@/lib/api";
import PlanSaveSection from "@/components/PlanSaveSection";

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "ready"; local: ConditionContent | null; backend: BackendRecommendations | null };

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const rawId = searchParams.get("id") ?? "";

  const userID = (() => {
    const id = (session?.user as { id?: string } | null)?.id;
    const n = id ? parseInt(id, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  const [pageState, setPageState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    if (!rawId) {
      router.replace("/search");
      return;
    }

    let cancelled = false;

    async function load() {
      setPageState({ status: "loading" });

      const numericID = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;

      if (numericID) {
        // Backend numeric ID path
        const backend = await getRecommendations(numericID);
        if (cancelled) return;

        if (!backend) {
          setPageState({ status: "not_found" });
          return;
        }

        // Try to find local rich content by matching condition name
        const local = findConditionByQuery(backend.condition.conditionName) ?? null;
        setPageState({ status: "ready", local, backend });
      } else {
        // Local slug path (legacy / local-fallback from confirm)
        const local = findConditionById(rawId) ?? null;
        if (!local) {
          if (!cancelled) setPageState({ status: "not_found" });
          return;
        }
        if (!cancelled) setPageState({ status: "ready", local, backend: null });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [rawId, router]);

  if (sessionStatus === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Loading your support plan...</h2>
            <p>Checking your session before opening condition guidance.</p>
          </article>
        </section>
      </main>
    );
  }

  if (sessionStatus === "unauthenticated") {
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
              <Link href="/entry?mode=login" className="gaia-btn gaia-btn-primary">
                Log In
              </Link>
              <Link href="/entry?mode=register" className="gaia-btn gaia-btn-secondary">
                Register
              </Link>
              <Link href="/overview?mode=guest&preview=1#guest-preview" className="gaia-btn gaia-btn-ghost">
                Guest Preview
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  if (pageState.status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Loading your support plan...</h2>
            <p>Fetching your condition-specific wellness guidance.</p>
          </article>
        </section>
      </main>
    );
  }

  if (pageState.status === "not_found") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Condition not found</h2>
            <p>No guidance path matched this condition. Please search again.</p>
            <div className="gaia-actions">
              <Link href="/search" className="gaia-btn gaia-btn-primary">
                Back to search
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  const { local, backend } = pageState;

  // Determine display values — backend wins for title/overview if no local
  const conditionTitle =
    local?.title ?? backend?.condition.conditionName ?? "Condition Support Plan";
  const conditionOverview =
    local?.supportiveOverview ?? backend?.condition.description ?? "";
  const disclaimer = local?.disclaimer ??
    "This content is supportive wellness guidance only. It does not diagnose, treat, or cure disease, and it does not replace your clinician\u2019s plan.";

  // Backend recommended herbs (exclude "avoid")
  const recommendedHerbs = backend?.herbs.filter(
    (h) => h.recommendationLevel !== "avoid"
  ) ?? [];
  const avoidHerbs = backend?.herbs.filter(
    (h) => h.recommendationLevel === "avoid"
  ) ?? [];

  // Backend safety notes merged with local precautions
  const backendSafetyMessages = backend?.safetyNotes.map((n) => n.message) ?? [];

  return (
    <main className="gaia-page">
      <section className="gaia-shell gaia-results-shell">

        {/* Header */}
        <header className="gaia-header-card">
          <p className="gaia-kicker">Support Plan</p>
          <h1>{conditionTitle}</h1>
          <p>{conditionOverview}</p>
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
            <strong>Medical disclaimer —</strong> {disclaimer}
          </p>
        </article>

        {/* ── 1. Botanical Elixir ── */}
        {local && (
          <article className="gaia-card gaia-elixir-card">
            <div className="gaia-results-heading">
              <span className="gaia-section-badge gaia-elixir-badge" aria-hidden>1</span>
              <div className="gaia-section-title" style={{ flex: 1 }}>
                <h2>{local.elixir.name}</h2>
                <span className="gaia-section-kicker">Botanical elixir</span>
              </div>
            </div>
            <p>{local.elixir.purpose}</p>
            <hr className="gaia-divider" />

            <div className="gaia-elixir-grid">
              <div>
                <h3>Ingredients</h3>
                <ul>
                  {local.elixir.ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Method</h3>
                <ol>
                  {local.elixir.method.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="gaia-list-card">
              <p className="gaia-section-kicker" style={{ marginBottom: "0.5rem" }}>Safety notes</p>
              <ul>
                {local.elixir.safetyNotes.map((note) => (
                  <li key={note} className="gaia-note">{note}</li>
                ))}
              </ul>
            </div>
          </article>
        )}

        {/* ── 2. Recommended Herbs (backend) ── */}
        {recommendedHerbs.length > 0 && (
          <article className="gaia-card">
            <div className="gaia-results-heading">
              <span className="gaia-section-badge" aria-hidden>{local ? "2" : "1"}</span>
              <div className="gaia-section-title" style={{ flex: 1 }}>
                <h2>Recommended Herbs</h2>
                <span className="gaia-section-kicker">Botanical support</span>
              </div>
            </div>
            <p className="gaia-note">
              Herbs associated with this condition path. All are supportive only
              — discuss with your clinician before adding supplements.
            </p>
            <hr className="gaia-divider" />
            <ul>
              {recommendedHerbs.map((herb) => (
                <li key={herb.herbID}>
                  <strong>{herb.herbName}</strong>
                  {herb.latinName ? (
                    <span className="gaia-note"> — {herb.latinName}</span>
                  ) : null}
                  {herb.overview ? <p className="gaia-note" style={{ margin: "0.15rem 0 0" }}>{herb.overview}</p> : null}
                  {herb.usageNotes ? <p className="gaia-note" style={{ margin: "0.1rem 0 0.4rem" }}>{herb.usageNotes}</p> : null}
                </li>
              ))}
            </ul>
            {avoidHerbs.length > 0 && (
              <div className="gaia-list-card" style={{ marginTop: "0.75rem" }}>
                <p className="gaia-section-kicker" style={{ marginBottom: "0.45rem" }}>Herbs to avoid with this condition</p>
                <ul>
                  {avoidHerbs.map((herb) => (
                    <li key={herb.herbID} className="gaia-note">
                      <strong>{herb.herbName}</strong>
                      {herb.linkNotes ? ` — ${herb.linkNotes}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        )}

        {/* ── 3. Diet Approach ── */}
        {local && (
          <article className="gaia-card">
            <div className="gaia-results-heading">
              <span className="gaia-section-badge" aria-hidden>{recommendedHerbs.length > 0 ? "3" : "2"}</span>
              <div className="gaia-section-title" style={{ flex: 1 }}>
                <h2>{local.dietApproach.name}</h2>
                <span className="gaia-section-kicker">Nutrition</span>
              </div>
            </div>
            <p>{local.dietApproach.summary}</p>
            <hr className="gaia-divider" />
            <ul>
              {local.dietApproach.principles.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </article>
        )}

        {/* ── 4. One-Day Meal Plan ── */}
        {local && (
          <article className="gaia-card gaia-surface-muted">
            <div className="gaia-results-heading">
              <span className="gaia-section-badge" aria-hidden>{recommendedHerbs.length > 0 ? "4" : "3"}</span>
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
              {local.oneDayPlan.map((meal) => (
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
        )}

        {/* ── 5. Lifestyle Support ── */}
        {local && (
          <article className="gaia-card">
            <div className="gaia-results-heading">
              <span className="gaia-section-badge" aria-hidden>{recommendedHerbs.length > 0 ? "5" : "4"}</span>
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
              {local.lifestyleTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </article>
        )}

        {/* ── 6. Precautions & Safety ── */}
        <article className="gaia-card gaia-precautions-card">
          <div className="gaia-results-heading">
            <span className="gaia-section-badge" aria-hidden>
              {local ? (recommendedHerbs.length > 0 ? "6" : "5") : "2"}
            </span>
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>Precautions &amp; When to See a Doctor</h2>
              <span className="gaia-section-kicker">Safety first</span>
            </div>
          </div>
          {local && (
            <ul>
              {local.precautions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {backendSafetyMessages.length > 0 && (
            <div className="gaia-list-card" style={{ marginTop: local ? "0.75rem" : 0 }}>
              <p className="gaia-section-kicker" style={{ marginBottom: "0.45rem" }}>
                Herb &amp; mixture safety notes
              </p>
              <ul>
                {backendSafetyMessages.map((msg) => (
                  <li key={msg} className="gaia-note">{msg}</li>
                ))}
              </ul>
            </div>
          )}
          {!local && backendSafetyMessages.length === 0 && (
            <p className="gaia-note">Always consult your clinician before starting new supplements or changing your routine.</p>
          )}
        </article>

        {/* ── Save Plan / Reminder ── */}
        <PlanSaveSection
          sessionStatus={sessionStatus}
          userID={userID}
          backend={backend}
          conditionTitle={conditionTitle}
        />

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
              <h2>Loading support plan...</h2>
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

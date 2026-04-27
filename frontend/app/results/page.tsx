"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getRecommendations, fetchUserPlans, type BackendRecommendations, type UserPlan } from "@/lib/api";
import PlanSaveSection from "@/components/PlanSaveSection";
import IngredientIdentifier from "@/components/IngredientIdentifier";
import NavArrows from "@/components/NavArrows";
import { FALLBACK_DISCLAIMER, EMPTY_STATES } from "@/lib/constants";

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "ready"; backend: BackendRecommendations };

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const rawId = searchParams.get("id") ?? "";
  const isSavedView = searchParams.get("saved") === "1";

  const userID = (() => {
    const id = (session?.user as { id?: string } | null)?.id;
    const n = id ? parseInt(id, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  const [pageState, setPageState] = useState<PageState>({ status: "loading" });
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);

  useEffect(() => {
    if (!rawId) {
      router.replace("/search");
      return;
    }

    let cancelled = false;

    async function load() {
      setPageState({ status: "loading" });

      const numericID = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;
      if (!numericID) {
        setPageState({ status: "not_found" });
        return;
      }

      const backend = await getRecommendations(numericID);
      if (cancelled) return;

      if (!backend) {
        setPageState({ status: "not_found" });
        return;
      }

      setPageState({ status: "ready", backend });
    }

    load();
    return () => { cancelled = true; };
  }, [rawId, router]);

  useEffect(() => {
    if (!userID) return;
    fetchUserPlans(userID).then(setUserPlans);
  }, [userID]);

  if (sessionStatus === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card gaia-loading-card">
            <h2>One moment...</h2>
            <p>Checking your session.</p>
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
              <h2>Sign in to view your plan</h2>
              <span className="gaia-section-kicker">Members only</span>
            </div>
            <p>
              Full wellness plans are available to members. Create a free
              account or sign in to access your complete guidance path.
            </p>
            <div className="gaia-actions">
              <Link href="/entry?mode=login" className="gaia-btn gaia-btn-primary">
                Log in
              </Link>
              <Link href="/entry?mode=register" className="gaia-btn gaia-btn-secondary">
                Create account
              </Link>
              <Link href="/overview" className="gaia-btn gaia-btn-ghost">
                View G.A.I.A. Overview
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
          <article className="gaia-card gaia-loading-card">
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
            <h2>No path found</h2>
            <p>
              Gaia couldn&apos;t match this condition yet. Try a different
              term from the search page.
            </p>
            <div className="gaia-actions">
              <Link href="/search" className="gaia-btn gaia-btn-primary">
                Search again
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  const { backend } = pageState;

  const herbs = backend.herbs ?? [];
  const recipes = backend.recipes ?? [];
  const mixtures = backend.mixtures ?? [];
  const safetyNotes = backend.safetyNotes ?? [];

  const recommendedHerbs = herbs.filter((h) => h.recommendationLevel !== "avoid");
  const avoidHerbs = herbs.filter((h) => h.recommendationLevel === "avoid");
  const backendSafetyMessages = safetyNotes.map((n) => n.message);
  const disclaimer = backend.disclaimer ?? FALLBACK_DISCLAIMER;

  let badge = 0;
  const mixturesBadge = mixtures.length > 0 ? ++badge : null;
  const herbsBadge = (recommendedHerbs.length > 0 || avoidHerbs.length > 0) ? ++badge : null;
  const recipesBadge = recipes.length > 0 ? ++badge : null;
  const precautionsBadge = ++badge;

  return (
    <main className="gaia-page">
      <section className="gaia-shell gaia-results-shell">

        {/* Header */}
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Support Plan</p>
          <h1>{backend.condition?.conditionName ?? "Condition"}</h1>
          <p>{backend.condition?.description ?? ""}</p>
        </header>

        {/* Disclaimer — always first after header */}
        <article className="gaia-card gaia-disclaimer">
          <p>
            <strong>Medical disclaimer —</strong> {disclaimer}
          </p>
        </article>

        {/* ── 1. Botanical Mixtures ── */}
        <article className="gaia-card gaia-elixir-card">
          <div className="gaia-results-heading">
            {mixturesBadge && <span className="gaia-section-badge gaia-elixir-badge" aria-hidden>{mixturesBadge}</span>}
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>
                {mixtures.length === 1
                  ? mixtures[0]?.mixtureName
                  : "Botanical Mixtures"}
              </h2>
              <span className="gaia-section-kicker">Botanical elixir</span>
            </div>
          </div>
          {mixtures.length === 0 ? (
            <p className="gaia-note">{EMPTY_STATES.mixtures}</p>
          ) : (
            <div className="gaia-meals-grid">
              {mixtures.map((mixture) => (
                <Link
                  key={mixture.mixtureID}
                  href={`/mixtures/${mixture.mixtureID}`}
                  className="gaia-meal"
                  style={{ display: "block", textDecoration: "none" }}
                >
                  {mixtures.length > 1 && (
                    <h3 style={{ marginBottom: "0.25rem" }}>{mixture.mixtureName}</h3>
                  )}
                  <p>{mixture.purpose}</p>
                  <p className="gaia-note" style={{ marginTop: "0.5rem", fontSize: "0.78rem" }}>
                    View preparation →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* ── 2. Recommended Herbs ── */}
        <article className="gaia-card">
          <div className="gaia-results-heading">
            {herbsBadge && <span className="gaia-section-badge" aria-hidden>{herbsBadge}</span>}
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>Recommended Herbs</h2>
              <span className="gaia-section-kicker">Botanical support</span>
            </div>
          </div>
          <p className="gaia-note">
            Herbs associated with this condition path. All are supportive only
            — discuss with your clinician before adding supplements.
          </p>
          {recommendedHerbs.length === 0 ? (
            <p className="gaia-note">{EMPTY_STATES.herbs}</p>
          ) : (
            <>
              <hr className="gaia-divider" />
              <ul>
                {recommendedHerbs.map((herb) => (
                  <li key={herb.herbID}>
                    <strong>{herb.herbName}</strong>
                    {herb.latinName ? (
                      <span className="gaia-note"> — {herb.latinName}</span>
                    ) : null}
                    {herb.overview ? (
                      <p className="gaia-note" style={{ margin: "0.15rem 0 0" }}>{herb.overview}</p>
                    ) : null}
                    {herb.usageNotes ? (
                      <p className="gaia-note" style={{ margin: "0.1rem 0 0.4rem" }}>{herb.usageNotes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          )}
          {avoidHerbs.length > 0 && (
            <div className="gaia-list-card gaia-avoid-card" style={{ marginTop: "0.75rem" }}>
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

        {/* ── Ingredient Identifier (authenticated users only) ── */}
        {sessionStatus === "authenticated" && (
          <article className="gaia-card gaia-identifier-card">
            <div className="gaia-section-title">
              <h2>Ingredient Check</h2>
              <span className="gaia-section-kicker">Smart assist</span>
            </div>
            <p className="gaia-note">
              Upload or capture an ingredient to identify its properties and relevance to your condition.
            </p>
            <IngredientIdentifier />
          </article>
        )}

        {/* ── 3. Recipes ── */}
        <article className="gaia-card gaia-surface-muted">
          <div className="gaia-results-heading">
            {recipesBadge && <span className="gaia-section-badge" aria-hidden>{recipesBadge}</span>}
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>
                {recipes.length === 1
                  ? recipes[0].recipeName
                  : "Recipes"}
              </h2>
              <span className="gaia-section-kicker">Nutrition</span>
            </div>
          </div>
          {recipes.length === 0 ? (
            <p className="gaia-note">{EMPTY_STATES.recipes}</p>
          ) : (
            <div className="gaia-meals-grid">
              {recipes.map((recipe) => (
                <Link
                  key={recipe.recipeID}
                  href={`/recipes/${recipe.recipeID}`}
                  className="gaia-meal"
                  style={{ display: "block", textDecoration: "none" }}
                >
                  <h3 style={{ marginBottom: "0.3rem" }}>{recipe.recipeName}</h3>
                  {recipe.dietTags && (
                    <div className="gaia-chip-row" style={{ marginTop: "0.3rem", marginBottom: "0.5rem" }}>
                      {recipe.dietTags.split(",").map((tag) => (
                        <span key={tag.trim()} className="gaia-chip">{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                  {recipe.description && (
                    <p className="gaia-note">{recipe.description}</p>
                  )}
                  <p className="gaia-note" style={{ marginTop: "0.4rem", fontSize: "0.78rem" }}>
                    {recipe.prepTime != null ? `${recipe.prepTime} min · ` : ""}View full recipe →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* ── 4. Precautions & Safety ── */}
        <article className="gaia-card gaia-precautions-card">
          <div className="gaia-results-heading">
            <span className="gaia-section-badge" aria-hidden>{precautionsBadge}</span>
            <div className="gaia-section-title" style={{ flex: 1 }}>
              <h2>Precautions &amp; When to See a Doctor</h2>
              <span className="gaia-section-kicker">Safety first</span>
            </div>
          </div>
          {backendSafetyMessages.length > 0 ? (
            <ul>
              {backendSafetyMessages.map((msg, index) => (
                <li key={index} className="gaia-note">{msg}</li>
              ))}
            </ul>
          ) : (
            <p className="gaia-note">{EMPTY_STATES.safety}</p>
          )}
        </article>

        {/* ── Save Plan / Reminder ── */}
        {!isSavedView && (
          <PlanSaveSection
            sessionStatus={sessionStatus}
            userID={userID}
            backend={backend}
            conditionTitle={backend.condition?.conditionName ?? "Condition"}
            userPlans={userPlans}
          />
        )}

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

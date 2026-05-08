"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRecipe, type BackendRecipe } from "@/lib/api";
import NavArrows from "@/components/NavArrows";

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "ready"; recipe: BackendRecipe };

function parseLines(text: string): string[] {
  if (text.includes("\n")) {
    return text.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseSteps(text: string): string[] {
  const numbered = text
    .split(/\n?\d+\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (numbered.length > 1) return numbered;

  const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;

  return [text.trim()];
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  // ✅ FIX: compute BEFORE state
  const numericID = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;

  // ✅ FIX: initial state depends on numericID (NO setState in effect)
  const [pageState, setPageState] = useState<PageState>(
    numericID ? { status: "loading" } : { status: "not_found" }
  );

  useEffect(() => {
    if (!numericID) return;

    let cancelled = false;

    getRecipe(numericID).then((recipe) => {
      if (cancelled) return;

      setPageState(
        recipe
          ? { status: "ready", recipe }
          : { status: "not_found" }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [numericID]);

  // =========================
  // UI STATES
  // =========================

  if (pageState.status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell" style={{ maxWidth: 780 }}>
          <article className="gaia-card gaia-loading-card">
            <h2>Preparing your recipe...</h2>
            <p className="gaia-note">Gathering the details.</p>
          </article>
        </section>
      </main>
    );
  }

  if (pageState.status === "not_found") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell" style={{ maxWidth: 780 }}>
          <article className="gaia-card">
            <h2>Recipe not found</h2>
            <p className="gaia-note">
              This recipe could not be loaded. Return to your support plan to explore available options.
            </p>
            <div className="gaia-actions" style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="gaia-btn gaia-btn-primary"
                onClick={() => router.back()}
              >
                Back to plan
              </button>
            </div>
          </article>
        </section>
      </main>
    );
  }

  const { recipe } = pageState;

  const dietChips = recipe.dietTags
    ? recipe.dietTags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const ingredientLines = recipe.ingredients
    ? parseLines(recipe.ingredients)
    : [];

  const steps = recipe.instructions
    ? parseSteps(recipe.instructions)
    : [];

  return (
    <main className="gaia-page">
      <section className="gaia-shell" style={{ maxWidth: 780 }}>

        {/* Header */}
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Nourishing Recipe</p>
          <h1>{recipe.recipeName}</h1>

          {recipe.description && <p>{recipe.description}</p>}

          <div className="gaia-chip-row">
            {recipe.prepTime != null && (
              <span className="gaia-chip">{recipe.prepTime} min</span>
            )}
            {dietChips.map((chip) => (
              <span key={chip} className="gaia-chip">
                {chip}
              </span>
            ))}
          </div>
        </header>

        {/* Ingredients */}
        {ingredientLines.length > 0 && (
          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>Ingredients</h2>
              <span className="gaia-section-kicker">What you need</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.45rem" }}>
              {ingredientLines.map((item, i) => (
                <li key={i} className="gaia-ingredient-row">{item}</li>
              ))}
            </ul>
          </article>
        )}

        {/* Method */}
        {steps.length > 0 && (
          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>Method</h2>
              <span className="gaia-section-kicker">How to prepare</span>
            </div>
            {steps.length === 1 ? (
              <p>{steps[0]}</p>
            ) : (
              <ol className="gaia-steps">
                {steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
          </article>
        )}

        {/* Navigation */}
        <div className="gaia-results-nav">
          <button
            className="gaia-btn gaia-btn-primary"
            onClick={() => router.back()}
          >
            Back to your plan
          </button>
          <Link href="/search" className="gaia-btn gaia-btn-secondary">
            Search conditions
          </Link>
        </div>

      </section>
    </main>
  );
}
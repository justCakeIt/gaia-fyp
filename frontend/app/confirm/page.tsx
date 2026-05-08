"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NavArrows from "@/components/NavArrows";
import { matchCondition, type BackendConditionMatch } from "@/lib/api";

type MatchState =
  | { status: "loading" }
  | { status: "no_match" }
  | { status: "matched"; match: BackendConditionMatch }
  | { status: "error"; message: string };

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const query = searchParams.get("query")?.trim() ?? "";

  const [matchState, setMatchState] = useState<MatchState>({ status: "loading" });

  useEffect(() => {
    if (!query) {
      router.replace("/search");
      return;
    }

    let cancelled = false;

    async function resolveMatch() {
      setMatchState({ status: "loading" });

      try {
        const backendMatch = await matchCondition(query);
        if (cancelled) return;

        if (backendMatch) {
          setMatchState({ status: "matched", match: backendMatch });
        } else {
          setMatchState({ status: "no_match" });
        }
      } catch {
        if (!cancelled) {
          setMatchState({
            status: "error",
            message: "Could not reach the condition service. Please check your connection and try again.",
          });
        }
      }
    }

    resolveMatch();
    return () => { cancelled = true; };
  }, [query, router]);

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
            <h2>Sign in to continue</h2>
            <p>
              Condition confirmation is available to members. Create a free
              account or log in to access your full wellness path.
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

  if (!query) {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card gaia-loading-card">
            <h2>Redirecting...</h2>
            <p>Taking you back to search.</p>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="gaia-page">
      <section className="gaia-shell">
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Condition Match</p>
          <h1>Confirm Your Condition</h1>
          <p>
            G.A.I.A. found a match for &ldquo;{query}&rdquo;. Please confirm
            this matches your diagnosed condition before opening your wellness
            path.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Clinician-first</span>
            <span className="gaia-chip">Supportive only</span>
          </div>
        </header>

        {matchState.status === "loading" && (
          <article className="gaia-card gaia-loading-card" aria-live="polite" aria-busy="true">
            <h2>Searching...</h2>
            <p>Matching &ldquo;{query}&rdquo; against supported conditions.</p>
          </article>
        )}

        {matchState.status === "no_match" && (
          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>No match found</h2>
              <span className="gaia-section-kicker">No results</span>
            </div>
            <p>
              No condition matched &ldquo;{query}&rdquo;. Try rephrasing your
              query or using a different term.
            </p>
            <div className="gaia-actions">
              <Link href="/search" className="gaia-btn gaia-btn-primary">
                Try a different search
              </Link>
            </div>
          </article>
        )}

        {matchState.status === "matched" && (
          <article className="gaia-card gaia-member-card" style={{ borderTop: "3px solid var(--gaia-border-gold)" }}>
            <div className="gaia-section-title">
              <h2>{matchState.match.conditionName}</h2>
              <span className="gaia-section-kicker">Match found</span>
            </div>
            <p>{matchState.match.description}</p>
            <div className="gaia-disclaimer">
              <strong>Please confirm this matches your diagnosed condition.</strong>{" "}
              G.A.I.A. does not diagnose. It provides supportive wellness
              guidance for conditions already confirmed by a clinician.
            </div>
            <div className="gaia-actions">
              <button
                type="button"
                className="gaia-btn gaia-btn-primary"
                onClick={() => router.push(`/results?id=${matchState.match.conditionID}`)}
              >
                Yes, open my path
              </button>
              <Link href="/search" className="gaia-btn gaia-btn-secondary">
                Search again
              </Link>
            </div>
          </article>
        )}

        {matchState.status === "error" && (
          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>Something went wrong</h2>
              <span className="gaia-section-kicker">Connection issue</span>
            </div>
            <p className="gaia-error">{matchState.message}</p>
            <div className="gaia-actions">
              <button
                type="button"
                className="gaia-btn gaia-btn-primary"
                onClick={() => router.push(`/confirm?query=${encodeURIComponent(query)}`)}
              >
                Try again
              </button>
              <Link href="/search" className="gaia-btn gaia-btn-ghost">
                Back to search
              </Link>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="gaia-page">
          <section className="gaia-shell">
            <article className="gaia-card">
              <h2>Loading condition confirmation...</h2>
              <p>Preparing your selected condition details.</p>
            </article>
          </section>
        </main>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}

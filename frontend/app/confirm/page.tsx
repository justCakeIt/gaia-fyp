"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { findConditionByQuery, type ConditionContent } from "@/lib/conditions";
import { matchCondition, type BackendConditionMatch } from "@/lib/api";

type MatchState =
  | { status: "loading" }
  | { status: "no_match" }
  | { status: "matched_backend"; match: BackendConditionMatch }
  | { status: "matched_local"; match: ConditionContent }
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
        // Try backend first (DB-backed synonym matching)
        const backendMatch = await matchCondition(query);
        if (cancelled) return;

        if (backendMatch) {
          setMatchState({ status: "matched_backend", match: backendMatch });
          return;
        }

        // Backend unavailable or no DB match — fall back to local library
        const localMatch = findConditionByQuery(query);
        if (cancelled) return;

        if (localMatch) {
          setMatchState({ status: "matched_local", match: localMatch });
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
          <article className="gaia-card">
            <h2>Loading access...</h2>
            <p>Checking your session before opening condition confirmation.</p>
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
            <h2>Guest Preview Only</h2>
            <p>
              Detailed condition confirmation is reserved for registered users.
              Guest mode gives you a curated overview and feature preview.
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

  if (!query) {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Redirecting...</h2>
            <p>Taking you back to search.</p>
          </article>
        </section>
      </main>
    );
  }

  function handleConfirmBackend(conditionID: number) {
    router.push(`/results?id=${conditionID}`);
  }

  function handleConfirmLocal(id: string) {
    router.push(`/results?id=${id}`);
  }

  return (
    <main className="gaia-page">
      <section className="gaia-shell">
        <header className="gaia-header-card">
          <p className="gaia-kicker">Condition Match</p>
          <h1>Does This Look Right?</h1>
          <p>
            Gaia searched for &ldquo;{query}&rdquo;. Please confirm this is the
            condition you have already been diagnosed with before continuing.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Clinician-first</span>
            <span className="gaia-chip">Supportive only</span>
          </div>
        </header>

        {matchState.status === "loading" && (
          <article className="gaia-card" aria-live="polite" aria-busy="true">
            <h2>Searching...</h2>
            <p>Matching &ldquo;{query}&rdquo; against supported conditions.</p>
          </article>
        )}

        {matchState.status === "no_match" && (
          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>No match found</h2>
              <span className="gaia-section-kicker">Fatty Liver / MASLD focus</span>
            </div>
            <p>
              Gaia&rsquo;s current complete guidance path is for <strong>Fatty Liver
              (MASLD / NAFLD)</strong>. Try one of the terms below, or return to
              search to rephrase your query.
            </p>
            <div className="gaia-chip-row" style={{ marginTop: "0.2rem" }}>
              {["fatty liver", "MASLD", "NAFLD"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className="gaia-chip"
                  onClick={() => router.push(`/confirm?query=${encodeURIComponent(t)}`)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="gaia-actions">
              <Link href="/search" className="gaia-btn gaia-btn-primary">
                Try a different search
              </Link>
            </div>
          </article>
        )}

        {matchState.status === "matched_backend" && (
          <article className="gaia-card gaia-member-card">
            <div className="gaia-section-title">
              <h2>{matchState.match.conditionName}</h2>
              <span className="gaia-section-kicker">Match found</span>
            </div>
            <p>{matchState.match.description}</p>
            <div className="gaia-disclaimer">
              <strong>Before you continue —</strong> this guidance is supportive
              only. Proceed only if <em>{matchState.match.conditionName}</em> is a
              condition you have already been diagnosed with by a clinician.
            </div>
            <div className="gaia-actions">
              <button
                type="button"
                className="gaia-btn gaia-btn-primary"
                onClick={() => handleConfirmBackend(matchState.match.conditionID)}
              >
                Yes, open my path
              </button>
              <Link href="/search" className="gaia-btn gaia-btn-secondary">
                Search again
              </Link>
            </div>
          </article>
        )}

        {matchState.status === "matched_local" && (
          <article className="gaia-card gaia-member-card">
            <div className="gaia-section-title">
              <h2>{matchState.match.title}</h2>
              <span className="gaia-section-kicker">Match found</span>
            </div>
            <p>{matchState.match.supportiveOverview}</p>
            <div className="gaia-disclaimer">
              <strong>Before you continue —</strong> this guidance is supportive
              only. Proceed only if <em>{matchState.match.title}</em> is a
              condition you have already been diagnosed with by a clinician.
            </div>
            <div className="gaia-actions">
              <button
                type="button"
                className="gaia-btn gaia-btn-primary"
                onClick={() => handleConfirmLocal(matchState.match.id)}
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

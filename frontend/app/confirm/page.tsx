"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { findConditionByQuery } from "@/lib/conditions";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const query = searchParams.get("query")?.trim() ?? "";

  const match = useMemo(() => {
    if (!query) return null;
    return findConditionByQuery(query);
  }, [query]);

  useEffect(() => {
    if (status !== "unauthenticated" && !query) router.replace("/search");
  }, [query, router, status]);

  if (status === "loading") {
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

  if (status === "unauthenticated") {
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
              <Link href="/overview?mode=guest&preview=1#guest-preview" className="gaia-btn gaia-btn-secondary">
                Open Guest Preview
              </Link>
              <Link href="/entry" className="gaia-btn gaia-btn-primary">
                Log In for Full Access
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

  return (
    <main className="gaia-page">
      <section className="gaia-shell">
        <header className="gaia-header-card">
          <p className="gaia-kicker">Condition Match</p>
          <h1>Does This Look Right?</h1>
          <p>
            Gaia found a match for &ldquo;{query}&rdquo;. Please confirm this
            is the condition you have already been diagnosed with before
            continuing.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Clinician-first</span>
            <span className="gaia-chip">Supportive only</span>
          </div>
        </header>

        {!match ? (
          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>Not supported yet</h2>
              <span className="gaia-section-kicker">Coming soon</span>
            </div>
            <p>
              Gaia currently has a complete path for fatty liver / MASLD / NAFLD.
              Return to search and try one of those terms.
            </p>
            <div className="gaia-chip-row" style={{ marginTop: "0.2rem" }}>
              {["fatty liver", "MASLD", "NAFLD"].map((t) => (
                <span key={t} className="gaia-chip">{t}</span>
              ))}
            </div>
            <div className="gaia-actions">
              <Link href="/search" className="gaia-btn gaia-btn-primary">
                Search again
              </Link>
            </div>
          </article>
        ) : (
          <article className="gaia-card gaia-member-card">
            <div className="gaia-section-title">
              <h2>{match.title}</h2>
              <span className="gaia-section-kicker">Match found</span>
            </div>
            <p>{match.supportiveOverview}</p>
            <div className="gaia-disclaimer">
              <strong>Before you continue —</strong> this guidance is supportive
              only. Proceed only if <em>{match.title}</em> is a condition you
              have already been diagnosed with by a clinician.
            </div>
            <div className="gaia-actions">
              <button
                type="button"
                className="gaia-btn gaia-btn-primary"
                onClick={() => router.push(`/results?id=${match.id}`)}
              >
                Yes, open my path
              </button>
              <Link href="/search" className="gaia-btn gaia-btn-secondary">
                Search again
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

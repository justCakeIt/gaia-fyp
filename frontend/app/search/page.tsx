"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import NavArrows from "@/components/NavArrows";


export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [validationError, setValidationError] = useState("");
  const { status } = useSession();

  if (status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card gaia-loading-card">
            <h2>Just a moment...</h2>
            <p className="gaia-note">Verifying your session.</p>
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
              <h2>Sign in to search</h2>
              <span className="gaia-section-kicker">Members only</span>
            </div>
            <p className="gaia-note">
              Condition search and botanical wellness plans are available to members.
              Create a free account or sign in to find your path.
            </p>
            <div className="gaia-actions">
              <Link href="/entry?mode=login" className="gaia-btn gaia-btn-primary">
                Log in
              </Link>
              <Link href="/entry?mode=register" className="gaia-btn gaia-btn-secondary">
                Create account
              </Link>
              <Link href="/overview?mode=guest&preview=1#guest-preview" className="gaia-btn gaia-btn-ghost">
                View as guest
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setValidationError("Please enter a condition name before searching.");
      return;
    }
    setValidationError("");
    router.push(`/confirm?query=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="gaia-page">
      <section className="gaia-shell">
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Gaia Guidance</p>
          <h1>Find Your Path</h1>
          <p>
            Enter a diagnosed condition name. Gaia will find your
            matching botanical wellness path.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Condition-matched</span>
            <span className="gaia-chip">Botanically informed</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="gaia-card gaia-form-card gaia-surface-muted" style={{ borderTop: "3px solid var(--gaia-border-gold)" }}>
          <div className="gaia-section-title">
            <h2>Your Search</h2>
            <span className="gaia-section-kicker">Personalised</span>
          </div>
          <p className="gaia-note">
            Enter a condition name, abbreviation, or common synonym.
            G.A.I.A. will find your matching wellness path — for conditions
            you have already been diagnosed with.
          </p>
          <hr className="gaia-divider" />
          <label htmlFor="condition-query">Diagnosed Condition</label>
          <input
            id="condition-query"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. fatty liver, MASLD, NAFLD…"
            className="gaia-input"
            autoFocus
          />
          {validationError ? <p className="gaia-error">{validationError}</p> : null}
          <div className="gaia-actions">
            <button type="submit" className="gaia-btn gaia-btn-primary">
              Find my path
            </button>
            <Link href="/profile" className="gaia-btn gaia-btn-secondary">
              Back to profile
            </Link>
          </div>
          <p className="gaia-note" style={{ fontSize: "0.8rem", borderTop: "1px solid var(--gaia-border)", paddingTop: "0.75rem" }}>
            G.A.I.A. does not diagnose. It provides supportive guidance
            for conditions confirmed by a clinician.
          </p>
        </form>
      </section>
    </main>
  );
}

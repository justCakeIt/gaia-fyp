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
            <p>Checking your session.</p>
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
            <h2>Sign in to search</h2>
            <p>
              Full condition search is available to members. Create a free
              account or sign in to find your wellness path.
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
            Enter a diagnosed condition name. Gaia will find the matching
            supportive wellness path for you.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Condition-matched</span>
            <span className="gaia-chip">Botanically informed</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="gaia-card gaia-form-card gaia-surface-muted">
          <div className="gaia-section-title">
            <h2>Condition Search</h2>
            <span className="gaia-section-kicker">Guided</span>
          </div>
          <p>
            Use your diagnosed condition term, its abbreviation, or a common
            synonym. Gaia will match it to the right guidance path.
          </p>
          <hr className="gaia-divider" />
          <label htmlFor="condition-query">Your Condition</label>
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
        </form>
      </section>
    </main>
  );
}

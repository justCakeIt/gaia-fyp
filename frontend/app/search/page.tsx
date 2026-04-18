"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { status } = useSession();

  if (status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Loading access...</h2>
            <p>Checking your session before opening full condition search.</p>
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
            <h2>Member Access Required</h2>
            <p>
              Full condition search is available to registered members. Guests
              can still use the preview experience.
            </p>
            <div className="gaia-actions">
              <Link href="/overview?mode=guest&preview=1#guest-preview" className="gaia-btn gaia-btn-secondary">
                Open Guest Preview
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/confirm?query=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="gaia-page">
      <section className="gaia-shell">
        <header className="gaia-header-card">
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
          <div className="gaia-chip-row" aria-label="Condition suggestions">
            <span style={{ fontSize: "0.74rem", color: "var(--gaia-sage-500)", alignSelf: "center", marginRight: "0.2rem" }}>Try:</span>
            {["fatty liver", "MASLD", "NAFLD"].map((term) => (
              <button
                key={term}
                type="button"
                className="gaia-chip"
                onClick={() => setQuery(term)}
              >
                {term}
              </button>
            ))}
          </div>
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

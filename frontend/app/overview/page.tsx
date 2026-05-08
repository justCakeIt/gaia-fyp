"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import NavArrows from "@/components/NavArrows";

export default function OverviewPage() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <main className="gaia-page">
      <section className="gaia-shell">

        {/* 1. Hero */}
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">G.A.I.A. Overview</p>
          <h1>Explore G.A.I.A.</h1>
          <p>
            Green AI Alchemy — nature-led wellness guidance for people living
            with diagnosed conditions. Discover how G.A.I.A. works, what a full
            support path includes, and where to begin your journey.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Botanical</span>
            <span className="gaia-chip">Safety-forward</span>
            <span className="gaia-chip">Condition-matched</span>
          </div>
        </header>

        {/* 2. Guest vs Member comparison */}
        <article className="gaia-card">
          <h2 style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)", marginBottom: "1rem" }}>
            What you get
          </h2>
          <div className="gaia-grid gaia-grid-2">
            <div className="gaia-list-card">
              <p className="gaia-section-kicker" style={{ marginBottom: "0.75rem" }}>
                As a guest
              </p>
              <ul>
                <li>Preview the guidance experience</li>
                <li>See the wellness plan structure</li>
                <li>Understand the safety-first approach</li>
              </ul>
            </div>
            <div className="gaia-list-card" style={{ borderColor: "var(--gaia-border-gold)" }}>
              <p className="gaia-section-kicker" style={{ marginBottom: "0.75rem" }}>
                As a member
              </p>
              <ul>
                <li>Save your condition wellness plan</li>
                <li>Set and manage daily reminders</li>
                <li>Access your personal dashboard</li>
                <li>Return to your path anytime</li>
              </ul>
            </div>
          </div>
        </article>

        {/* 3. How it works */}
        <article className="gaia-card gaia-surface-muted">
          <p className="gaia-section-kicker" style={{ marginBottom: "0.85rem" }}>
            How it works
          </p>
          <ol className="gaia-steps">
            <li><strong>Search your diagnosed condition</strong></li>
            <li><strong>Confirm the matched support path</strong></li>
            <li>View your guidance — <strong>register to save it</strong></li>
          </ol>
        </article>

        {/* 4. About G.A.I.A. — dedicated section */}
        <article className="gaia-card gaia-surface-muted">
          <div className="gaia-section-title">
            <h2 style={{ fontSize: "clamp(1.25rem, 2.4vw, 1.7rem)" }}>About G.A.I.A.</h2>
            <span className="gaia-section-kicker">Our mission</span>
          </div>
          <p>
            Learn about the philosophy, botanical principles, and approach
            behind G.A.I.A. — and how it is designed to complement, not
            replace, professional care.
          </p>
          <div className="gaia-actions">
            <Link href="/about" className="gaia-btn gaia-btn-secondary">
              Read about G.A.I.A.
            </Link>
          </div>
        </article>

        {/* 5. Preview panel */}
        <article id="guest-preview" className="gaia-card">
          <p className="gaia-section-kicker" style={{ marginBottom: "0.75rem" }}>
            What a wellness path includes
          </p>
          <ul style={{ marginBottom: "1.25rem" }}>
            <li>Botanical elixir — curated herbal blend with method and safety notes</li>
            <li>Diet approach — nutrition principles matched to your condition</li>
            <li>One-day meal plan — breakfast, lunch, and dinner examples</li>
            <li>Lifestyle tips — daily habits to support your wellness rhythm</li>
            <li>Precautions — when to pause, and when to see your clinician</li>
          </ul>
          <p className="gaia-note" style={{ marginBottom: "1rem" }}>
            Full detail — complete recipes, herb profiles, and personalised
            reminders — is available to registered members.
          </p>
          {isAuthenticated ? (
            <div className="gaia-actions">
              <Link href="/search" className="gaia-btn gaia-btn-primary">
                Start Search
              </Link>
            </div>
          ) : (
            <div className="gaia-actions">
              <Link href="/entry?mode=register" className="gaia-btn gaia-btn-primary">
                Create Account to Access Full Plan
              </Link>
            </div>
          )}
        </article>

        {/* 6. Final CTA */}
        <article className="gaia-card gaia-member-card">
          {isAuthenticated ? (
            <>
              <h2 style={{ marginBottom: "0.5rem" }}>Your path is waiting.</h2>
              <p>
                Head to search to find your condition pathway, or return to your
                dashboard to view saved plans and reminders.
              </p>
              <div className="gaia-actions" style={{ marginTop: "1rem" }}>
                <Link href="/search" className="gaia-btn gaia-btn-primary">
                  Start Search
                </Link>
                <Link href="/profile" className="gaia-btn gaia-btn-secondary">
                  View Profile
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: "0.5rem" }}>Your own sanctuary awaits.</h2>
              <p>
                A free account gives you saved plans, daily reminders, and a
                personal dashboard — all in one calm place.
              </p>
              <div className="gaia-actions" style={{ marginTop: "1rem" }}>
                <Link href="/entry?mode=register" className="gaia-btn gaia-btn-primary">
                  Create Account
                </Link>
                <Link href="/entry?mode=login" className="gaia-btn gaia-btn-secondary">
                  Log In
                </Link>
              </div>
            </>
          )}
        </article>

        {/* 7. Safety note */}
        <article className="gaia-card gaia-disclaimer">
          <strong>Supportive guidance only —</strong> G.A.I.A. does not
          diagnose, treat, cure, or replace professional medical care. Always
          follow your clinician&apos;s advice.
        </article>

      </section>
    </main>
  );
}

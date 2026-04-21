import Link from "next/link";

export default async function OverviewPage() {
  return (
    <main className="gaia-page">
      <section className="gaia-shell">

        {/* 1. Hero */}
        <header className="gaia-header-card">
          <p className="gaia-kicker">Guest Preview</p>
          <h1>Explore G.A.I.A. as a Guest</h1>
          <p>
            Preview the guidance experience before committing to an account.
            Register when you are ready to save your plan, set reminders, and
            return to your personal wellness sanctuary.
          </p>
          <div className="gaia-actions" style={{ marginTop: "1rem" }}>
            <Link href="#guest-preview" className="gaia-btn gaia-btn-primary">
              Explore as Guest
            </Link>
          </div>
          <p className="gaia-note" style={{ marginTop: "0.85rem" }}>
            Ready to commit?{" "}
            <Link href="/entry?mode=register" style={{ textDecoration: "underline" }}>
              Create an account
            </Link>
            {" "}or{" "}
            <Link href="/entry?mode=login" style={{ textDecoration: "underline" }}>
              log in
            </Link>
            .
          </p>
        </header>

        {/* 2. Comparison */}
        <article className="gaia-card">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            <div>
              <p className="gaia-section-kicker" style={{ marginBottom: "0.65rem" }}>
                As a guest
              </p>
              <ul>
                <li>Preview the guidance experience</li>
                <li>See the wellness plan structure</li>
                <li>Understand the safety-first approach</li>
              </ul>
            </div>
            <div>
              <p className="gaia-section-kicker" style={{ marginBottom: "0.65rem" }}>
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

        {/* 3. Journey */}
        <article className="gaia-card gaia-surface-muted">
          <p className="gaia-section-kicker" style={{ marginBottom: "0.85rem" }}>
            How it works
          </p>
          <ol
            style={{
              padding: "0 0 0 1.1rem",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <li><strong>Search your diagnosed condition</strong></li>
            <li><strong>Confirm the matched support path</strong></li>
            <li><strong>View your guidance — register to save it</strong></li>
          </ol>
        </article>

        {/* 4. Preview panel */}
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
          <div className="gaia-actions">
            <Link href="/entry?mode=register" className="gaia-btn gaia-btn-primary">
              Create Account to Access Full Plan
            </Link>
          </div>
        </article>

        {/* 5. Final CTA */}
        <article className="gaia-card gaia-member-card">
          <h2 style={{ marginBottom: "0.5rem" }}>Your own sanctuary awaits.</h2>
          <p>
            A free account gives you saved plans, daily reminders, and a
            personal dashboard — all in one calm place.
          </p>
          <div className="gaia-actions" style={{ marginTop: "1rem" }}>
            <Link href="/entry?mode=register" className="gaia-btn gaia-btn-primary">
              Create Account
            </Link>
            <Link href="/entry?mode=login" className="gaia-btn gaia-btn-ghost">
              Log In
            </Link>
          </div>
        </article>

        {/* 6. Safety note */}
        <article className="gaia-card gaia-disclaimer">
          <strong>Supportive guidance only —</strong> G.A.I.A. does not
          diagnose, treat, cure, or replace professional medical care. Always
          follow your clinician&apos;s advice.
        </article>

      </section>
    </main>
  );
}

import Link from "next/link";

type OverviewPageProps = {
  searchParams: Promise<{ mode?: string; preview?: string }>;
};

export default async function OverviewPage({ searchParams }: OverviewPageProps) {
  const params = await searchParams;
  const isGuest = params.mode === "guest";
  const showPreview = isGuest || params.preview === "1";

  return (
    <main className="gaia-page">
      <section className="gaia-shell">

        {/* Hero */}
        <header className="gaia-header-card">
          <p className="gaia-kicker">Your Wellness Sanctuary</p>
          <h1>Welcome to G.A.I.A.</h1>
          <p>
            Green AI Alchemy offers calm, condition-aware wellness guidance built
            around botanical wisdom, practical nutrition, and daily lifestyle
            structure — always as a complement to professional medical care.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Botanical support</span>
            <span className="gaia-chip">Nutrition-first</span>
            <span className="gaia-chip">Safety-forward</span>
            <span className="gaia-chip">Never diagnostic</span>
          </div>
        </header>

        {/* Guest mode notice */}
        {isGuest ? (
          <article className="gaia-card gaia-surface-muted">
            <div className="gaia-section-title">
              <h2>Browsing as a guest</h2>
              <span className="gaia-section-kicker">No account needed</span>
            </div>
            <p>
              You can explore the Gaia experience right now. Create a free
              account whenever you are ready to unlock full condition journeys
              and save your wellness path.
            </p>
            <div className="gaia-actions">
              <Link href="/entry" className="gaia-btn gaia-btn-primary">
                Create Account
              </Link>
              <Link href="/entry" className="gaia-btn gaia-btn-ghost">
                Log In
              </Link>
            </div>
          </article>
        ) : null}

        {/* Three pillars */}
        <section className="gaia-grid gaia-grid-3" aria-label="Core purpose">
          <article className="gaia-card gaia-pillar-card">
            <div className="gaia-section-title">
              <h2>What G.A.I.A. Does</h2>
              <span className="gaia-section-kicker">Purpose</span>
            </div>
            <p>
              Translates condition-focused wellness support into practical, calm
              steps you can integrate into your daily rhythm.
            </p>
          </article>
          <article className="gaia-card gaia-surface-muted gaia-pillar-card">
            <div className="gaia-section-title">
              <h2>How It Feels</h2>
              <span className="gaia-section-kicker">Human-centered</span>
            </div>
            <p>
              Thoughtful, non-judgmental guidance with botanical context, food
              ideas, and safety framing — all gathered in one calm space.
            </p>
          </article>
          <article className="gaia-card gaia-pillar-card">
            <div className="gaia-section-title">
              <h2>Why It Matters</h2>
              <span className="gaia-section-kicker">Daily clarity</span>
            </div>
            <p>
              Small, consistent habits become easier when guidance is organized,
              personalized, and quick to revisit whenever you need it.
            </p>
          </article>
        </section>

        {/* Guest vs Member comparison */}
        <section className="gaia-grid gaia-grid-2" aria-label="Access levels">
          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>Guest Experience</h2>
              <span className="gaia-section-kicker">Available now</span>
            </div>
            <ul>
              <li>Browse the Gaia approach and wellness tone.</li>
              <li>Preview the safety-first recommendation style.</li>
              <li>Explore the high-level planning structure.</li>
              <li>Experience the interface before committing to an account.</li>
            </ul>
            <div className="gaia-actions" style={{ marginTop: "0.5rem" }}>
              <Link
                href="/overview?mode=guest&preview=1#guest-preview"
                className="gaia-btn gaia-btn-secondary"
              >
                Open Guest Preview
              </Link>
            </div>
          </article>

          <article className="gaia-card gaia-member-card">
            <div className="gaia-section-title">
              <h2>Registered Members</h2>
              <span className="gaia-section-kicker">Full access</span>
            </div>
            <ul>
              <li>Complete condition support journeys with full detail.</li>
              <li>Personalized profile experience tied to your account.</li>
              <li>Botanical elixir recipes, meal plans, and lifestyle tips.</li>
              <li>Quicker return access to guidance you use often.</li>
              <li>Growing feature set as G.A.I.A. expands.</li>
            </ul>
            <div className="gaia-actions" style={{ marginTop: "0.5rem" }}>
              <Link href="/entry" className="gaia-btn gaia-btn-primary">
                Create or Log In
              </Link>
            </div>
          </article>
        </section>

        {/* CTA */}
        <article className="gaia-card gaia-surface-muted">
          <div className="gaia-section-title">
            <h2>Start as Guest · Upgrade Anytime</h2>
            <span className="gaia-section-kicker">Flexible path</span>
          </div>
          <p>
            Begin exploring immediately. Create your account when you are ready
            to save progress and build a more personalized Gaia journey.
          </p>
          <div className="gaia-actions">
            <Link href="/entry" className="gaia-btn gaia-btn-primary">
              Register for Full Experience
            </Link>
            <Link
              href="/overview?mode=guest&preview=1#guest-preview"
              className="gaia-btn gaia-btn-secondary"
            >
              Explore as Guest
            </Link>
          </div>
        </article>

        {/* Guest preview section */}
        {showPreview ? (
          <article id="guest-preview" className="gaia-card">
            <div className="gaia-section-title">
              <h2>Guest Preview</h2>
              <span className="gaia-section-kicker">Limited access</span>
            </div>
            <p>
              As a guest you can see the Gaia approach and guidance style. Full
              condition journeys — including detailed plans, botanical recipes,
              and complete recommendation paths — unlock after sign-in.
            </p>
            <div className="gaia-list-card">
              <p className="gaia-section-kicker" style={{ marginBottom: "0.45rem" }}>What you can see in guest mode</p>
              <ul>
                <li>Sample condition support tone and structure.</li>
                <li>Preview of safety-first recommendation formatting.</li>
                <li>High-level examples of structured wellness planning.</li>
              </ul>
            </div>
            <p className="gaia-note">
              Full condition detail pages, botanical elixir recipes, and meal
              plans are available to registered members only.
            </p>
            <div className="gaia-actions">
              <Link href="/entry" className="gaia-btn gaia-btn-primary">
                Log In for Full Access
              </Link>
              <Link href="/entry" className="gaia-btn gaia-btn-secondary">
                Create Account
              </Link>
            </div>
          </article>
        ) : null}

        {/* Disclaimer */}
        <article className="gaia-card gaia-disclaimer">
          <strong>Supportive guidance only —</strong> G.A.I.A. is designed to
          complement professional care. It does not diagnose, treat, or replace
          your clinician&apos;s advice.
        </article>

      </section>
    </main>
  );
}

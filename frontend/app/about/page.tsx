"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const HOW_STEPS = [
  {
    n: "01",
    label: "Navigate the Pathway",
    body: "Gain clarity around a focused wellness pathway, beginning with Fatty Liver / MASLD.",
  },
  {
    n: "02",
    label: "Explore Recommendations",
    body: "Review structured suggestions — recipes, herbs, mixtures, and safety notes where available.",
  },
  {
    n: "03",
    label: "Build Your Blueprint",
    body: "Save a wellness plan that reflects your current focus and return to it anytime.",
  },
  {
    n: "04",
    label: "Nurture Consistency",
    body: "Set reminders that keep your intentions visible and your routine on track.",
  },
  {
    n: "05",
    label: "Return When You Need To",
    body: "Come back to your saved path whenever you need to re-centre and continue.",
  },
];

export default function AboutPage() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <main className="gaia-page">
      <section className="gaia-shell">

        {/* ── Hero ── */}
        <header className="gaia-header-card">
          <p className="gaia-kicker">About G.A.I.A.</p>
          <h1>The Architecture of a Turning Point</h1>
          <p>
            Finding clarity after a diagnosis starts with one thing: a point of
            stillness from which a steadier path can be built.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Supportive wellness</span>
            <span className="gaia-chip">Evidence-informed</span>
            <span className="gaia-chip">Safety-first</span>
          </div>
        </header>

        {/* ── Stillness ── */}
        <article className="gaia-card">
          <div className="gaia-section-title">
            <h2>The Moment It Changes</h2>
            <span className="gaia-section-kicker">Stillness</span>
          </div>
          <p>
            Often, we only truly listen to our bodies when they begin to whisper
            — or shout — in a language of discomfort, fatigue, or change.
            Receiving a health warning or a new diagnosis can feel like being
            caught in a sudden storm: a blur of clinical terms, unfamiliar
            advice, and the overwhelming question — <em>what now?</em>
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            In these moments, what many people need most is not more noise.
            They need a point of stillness — a way to clear the fog, understand
            the next step, and begin building a steadier path forward.
          </p>
        </article>

        {/* ── Introducing G.A.I.A. ── */}
        <article className="gaia-card gaia-member-card">
          <div className="gaia-section-title">
            <h2>Introducing G.A.I.A.</h2>
            <span className="gaia-section-kicker">Pathway</span>
          </div>
          <p>
            <strong>Green AI Alchemy — G.A.I.A. —</strong> was created to be
            that point of stillness. It is a supportive wellness companion
            designed to help organise the many threads of lifestyle management
            into one clear, manageable pathway.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            The current version begins with{" "}
            <strong>Fatty Liver / MASLD</strong>, demonstrating one complete
            polished journey: searching for a condition, confirming the pathway,
            viewing supportive recommendations, saving a wellness plan, and
            returning to it through daily reminders.
          </p>
          <p className="gaia-note" style={{ marginTop: "0.75rem" }}>
            G.A.I.A. does not replace medical care. It helps organise the
            lifestyle-supportive side of care — the small choices, routines, and
            reminders that can otherwise become scattered or forgotten.
          </p>
        </article>

        {/* ── Consistency ── */}
        <article className="gaia-card gaia-surface-muted">
          <div className="gaia-section-title">
            <h2>The Power of the Small and Steady</h2>
            <span className="gaia-section-kicker">Consistency</span>
          </div>
          <p>
            Wellness is rarely the result of one dramatic transformation. More
            often, it is shaped through the quiet alchemy of everyday life — the
            food that nourishes us, the way we move, the quality of our rest,
            and the patience we show ourselves under stress.
          </p>
          <p className="gaia-note" style={{ marginTop: "0.75rem" }}>
            These habits are not cures, and they should never replace
            professional care. But they can become part of the supportive ground
            on which better routines are built.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            By focusing on consistency rather than perfection, small intentional
            choices become easier to repeat, easier to remember, and easier to
            return to.
          </p>
        </article>

        {/* ── How G.A.I.A. Supports ── */}
        <article className="gaia-card">
          <div className="gaia-section-title">
            <h2>How G.A.I.A. Supports Your Journey</h2>
            <span className="gaia-section-kicker">Five steps</span>
          </div>
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0.5rem 0 0",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {HOW_STEPS.map(({ n, label, body }) => (
              <li
                key={n}
                style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
              >
                <span
                  className="gaia-section-badge"
                  aria-hidden
                  style={{ flexShrink: 0, fontSize: "0.72rem" }}
                >
                  {n}
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
                  <p className="gaia-note" style={{ margin: "0.2rem 0 0" }}>
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        {/* ── Responsibility ── */}
        <article className="gaia-card gaia-disclaimer">
          <div className="gaia-section-title">
            <strong>A Note on Care and Responsibility</strong>
            <span className="gaia-section-kicker">Responsibility</span>
          </div>
          <p style={{ marginTop: "0.5rem" }}>
            G.A.I.A. is a tool for organisation, education, and encouragement.{" "}
            <strong>It is not a doctor.</strong>
          </p>
          <p style={{ marginTop: "0.6rem" }}>
            This application does not diagnose, treat, or cure any medical
            condition. The information provided is for educational and supportive
            wellness purposes only and should never replace professional medical
            advice, diagnosis, or treatment.
          </p>
          <p style={{ marginTop: "0.6rem" }}>
            Always consult a qualified healthcare professional before making
            changes to medication, supplement intake, diet, or existing
            treatment routines.
          </p>
          <p className="gaia-note" style={{ marginTop: "0.6rem" }}>
            Your health is a partnership between you and your clinical team.
            G.A.I.A. is here to help organise the lifestyle side of that
            partnership.
          </p>
        </article>

        {/* ── Closing + CTA ── */}
        <article className="gaia-card gaia-member-card">
          <div className="gaia-section-title">
            <h2>The Long Horizon</h2>
            <span className="gaia-section-kicker">Begin</span>
          </div>
          <p>
            Health is not a destination reached in one leap. It is a
            relationship tended over time — lived in the quiet decisions made in
            the kitchen, on the walking path, during rest, and in the moments
            where we choose to begin again.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            When supportive actions are made clear and manageable, the daunting
            becomes doable.
          </p>
          <p
            style={{
              marginTop: "0.85rem",
              fontStyle: "italic",
              color: "var(--gaia-sage-500)",
              fontSize: "1.05rem",
            }}
          >
            Slow down. Breathe. Begin with one small choice.
          </p>

          <div className="gaia-actions" style={{ marginTop: "1.25rem" }}>
            {isAuthenticated ? (
              <>
                <Link href="/search" className="gaia-btn gaia-btn-primary">
                  Start Search
                </Link>
                <Link href="/profile" className="gaia-btn gaia-btn-secondary">
                  View Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/entry?mode=register" className="gaia-btn gaia-btn-primary">
                  Create Account
                </Link>
                <Link href="/entry?mode=login" className="gaia-btn gaia-btn-secondary">
                  Sign In
                </Link>
                <Link
                  href="/overview?mode=guest&preview=1#guest-preview"
                  className="gaia-btn gaia-btn-ghost"
                >
                  Guest Preview
                </Link>
              </>
            )}
          </div>
        </article>

      </section>
    </main>
  );
}

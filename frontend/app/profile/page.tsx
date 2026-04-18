"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  provider?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/entry");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Loading profile…</h2>
            <p>Checking your session and preparing your sanctuary.</p>
          </article>
        </section>
      </main>
    );
  }

  if (!session?.user) return null;

  const user = session.user as SessionUser;
  const displayName = user.name?.trim() || "Gaia Member";
  const authMode = user.provider === "google" ? "Google" : "email";

  async function handleLogout() {
    await signOut({ callbackUrl: "/entry" });
  }

  return (
    <main className="gaia-page">
      <section className="gaia-shell">

        {/* Welcome header */}
        <header className="gaia-header-card">
          <p className="gaia-kicker">Your Sanctuary</p>
          <h1>Welcome back, {displayName}</h1>
          <p>
            Gaia is here whenever you need grounding. Search a condition,
            open a wellness path, or simply take a breath — this space is yours.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Botanical support</span>
            <span className="gaia-chip">Nature wisdom</span>
            <span className="gaia-chip">Always safe</span>
          </div>
        </header>

        {/* Quick-start cards */}
        <section className="gaia-grid gaia-grid-3" aria-label="Quick actions">
          <article className="gaia-card gaia-action-primary">
            <div className="gaia-section-title">
              <h2>Search a Condition</h2>
              <span className="gaia-section-kicker">Start here</span>
            </div>
            <p>
              Enter your diagnosed condition to open a personalised,
              nature-led supportive guidance path.
            </p>
            <div className="gaia-actions">
              <Link href="/search" className="gaia-btn gaia-btn-primary">
                Go to search
              </Link>
            </div>
          </article>

          <article className="gaia-card gaia-action-secondary">
            <div className="gaia-section-title">
              <h2>Fatty Liver Path</h2>
              <span className="gaia-section-kicker">Quick open</span>
            </div>
            <p>
              MASLD / NAFLD support is fully available. Open the complete
              wellness journey directly in one step.
            </p>
            <div className="gaia-actions">
              <Link href="/confirm?query=MASLD" className="gaia-btn gaia-btn-secondary">
                Open MASLD path
              </Link>
            </div>
          </article>

          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>Session</h2>
              <span className="gaia-section-kicker">Secure</span>
            </div>
            <p>
              Signed in via {authMode}. Your session is private and secure.
              Sign out whenever you are ready.
            </p>
            <div className="gaia-actions">
              <button
                type="button"
                onClick={handleLogout}
                className="gaia-btn gaia-btn-ghost"
              >
                Sign out
              </button>
            </div>
          </article>
        </section>

        {/* Medical safety note */}
        <article className="gaia-card gaia-disclaimer">
          <strong>Medical safety note:</strong> G.A.I.A. offers supportive
          wellness content only. It does not diagnose, treat, or replace
          professional medical care. Always follow your clinician&apos;s advice.
        </article>

      </section>
    </main>
  );
}

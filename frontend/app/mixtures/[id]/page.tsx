"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMixture, type BackendMixtureDetail } from "@/lib/api";
import NavArrows from "@/components/NavArrows";

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "error"; message: string }
  | { status: "ready"; data: BackendMixtureDetail };

export default function MixturePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const rawId = params?.id;
  const numericID = rawId && /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;

  const [pageState, setPageState] = useState<PageState>(
    rawId && !numericID ? { status: "not_found" } : { status: "loading" }
  );

  useEffect(() => {
    if (!rawId) {
      router.replace("/profile");
      return;
    }

    if (!numericID) {
      return;
    }

    let cancelled = false;

    getMixture(numericID)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setPageState({ status: "not_found" });
        } else {
          setPageState({ status: "ready", data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPageState({
            status: "error",
            message:
              "Could not load elixir guide. Make sure the backend is running.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rawId, numericID, router]);

  if (pageState.status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card gaia-loading-card">
            <h2>Loading elixir...</h2>
            <p className="gaia-note">Gathering botanical details.</p>
          </article>
        </section>
      </main>
    );
  }

  if (pageState.status === "not_found") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Elixir not found</h2>
            <p className="gaia-note">
              This botanical mixture guide is not available.
            </p>
            <div className="gaia-actions">
              <Link href="/profile" className="gaia-btn gaia-btn-primary">
                Back to dashboard
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  if (pageState.status === "error") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell">
          <article className="gaia-card">
            <h2>Could not load</h2>
            <p className="gaia-error">{pageState.message}</p>
            <div className="gaia-actions">
              <Link href="/profile" className="gaia-btn gaia-btn-primary">
                Back to dashboard
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  const { data } = pageState;
  const herbs = data.herbs ?? [];
  const safetyNotes = data.safetyNotes ?? [];

  return (
    <main className="gaia-page">
      <section className="gaia-shell">

        {/* ── Header ── */}
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Botanical Elixir</p>
          <h1>{data.mixtureName}</h1>
          {data.purpose && <p>{data.purpose}</p>}
        </header>

        {/* ── Medical disclaimer ── */}
        <article className="gaia-card gaia-disclaimer">
          <p>
            <strong>Medical disclaimer —</strong> This content is supportive
            wellness guidance only. It does not diagnose, treat, or cure any
            disease. Always consult a qualified healthcare professional before
            beginning any herbal preparation.
          </p>
        </article>

        {/* ── Preparation instructions ── */}
        {data.instructions ? (
          <article className="gaia-card">
            <div className="gaia-section-title">
              <h2>Preparation</h2>
              <span className="gaia-section-kicker">How to prepare</span>
            </div>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
              {data.instructions}
            </p>
          </article>
        ) : null}

        {/* ── Dosage ── */}
        {data.dosage ? (
          <article className="gaia-card gaia-dosage-card">
            <div className="gaia-section-title">
              <h2>Dosage &amp; Usage</h2>
              <span className="gaia-section-kicker">Guidance</span>
            </div>
            <p>{data.dosage}</p>
          </article>
        ) : null}

        {/* ── Botanical ingredients ── */}
        <article className="gaia-card">
          <div className="gaia-section-title">
            <h2>Botanical Ingredients</h2>
            <span className="gaia-section-kicker">
              {herbs.length} ingredient{herbs.length !== 1 ? "s" : ""}
            </span>
          </div>
          {herbs.length === 0 ? (
            <p className="gaia-note">No ingredient details available.</p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: "0.55rem",
              }}
            >
              {herbs.map((herb) => (
                <li key={herb.herbID} className="gaia-elixir-herb-row">
                  <span
                    aria-hidden
                    style={{
                      color: "var(--gaia-earth-400)",
                      fontSize: "0.68rem",
                      marginTop: "0.22rem",
                      flexShrink: 0,
                    }}
                  >
                    ◆
                  </span>
                  <span>
                    <strong>{herb.herbName}</strong>
                    {herb.latinName ? (
                      <span className="gaia-note"> — {herb.latinName}</span>
                    ) : null}
                    {herb.amount || herb.unit ? (
                      <span className="gaia-note">
                        {" "}
                        · {[herb.amount, herb.unit].filter(Boolean).join(" ")}
                      </span>
                    ) : null}
                    {herb.role ? (
                      <span
                        className="gaia-chip"
                        style={{ marginLeft: "0.45rem", fontSize: "0.72rem" }}
                      >
                        {herb.role}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* ── Safety notes ── */}
        {safetyNotes.length > 0 ? (
          <article className="gaia-card gaia-precautions-card">
            <div className="gaia-section-title">
              <h2>Safety Notes</h2>
              <span className="gaia-section-kicker">Important</span>
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: "0.65rem",
              }}
            >
              {safetyNotes.map((note, i) => (
                <li
                  key={note.safetyNoteID ?? i}
                  className="gaia-safety-row"
                >
                  <span
                    aria-hidden
                    style={{
                      color: "var(--gaia-earth-400)",
                      fontSize: "0.66rem",
                      marginTop: "0.26rem",
                      flexShrink: 0,
                    }}
                  >
                    ▲
                  </span>
                  <span className="gaia-note">
                    {note.message}
                    {note.instructions ? (
                      <span> — {note.instructions}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ) : null}

        {/* ── Navigation ── */}
        <div className="gaia-results-nav">
          <button
            type="button"
            onClick={() => router.back()}
            className="gaia-btn gaia-btn-primary"
          >
            Back to plan
          </button>
          <Link href="/profile" className="gaia-btn gaia-btn-secondary">
            Dashboard
          </Link>
        </div>

      </section>
    </main>
  );
}

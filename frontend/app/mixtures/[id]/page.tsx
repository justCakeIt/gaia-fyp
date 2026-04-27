"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMixture, type BackendMixtureDetail, type BackendMixtureHerb, type BackendMixtureSafetyNote } from "@/lib/api";
import NavArrows from "@/components/NavArrows";

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "ready"; mixture: BackendMixtureDetail };

function parseSteps(text: string): string[] {
  const numbered = text.split(/\n?\d+\.\s+/).map((s) => s.trim()).filter(Boolean);
  if (numbered.length > 1) return numbered;
  const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return [text.trim()];
}

function RoleBadge({ role }: { role: BackendMixtureHerb["role"] }) {
  if (!role || role === "main") return null;
  const isOptional = role === "optional";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.58rem",
        fontWeight: 700,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        padding: "0.1rem 0.44rem",
        borderRadius: "999px",
        marginLeft: "0.42rem",
        verticalAlign: "middle",
        background: isOptional ? "rgba(150,114,68,0.11)" : "rgba(74,122,100,0.11)",
        border: `1px solid ${isOptional ? "rgba(150,114,68,0.22)" : "rgba(74,122,100,0.22)"}`,
        color: isOptional ? "var(--gaia-earth-500)" : "var(--gaia-sage-600)",
      }}
    >
      {role}
    </span>
  );
}

function SeverityPip({ severity }: { severity: BackendMixtureSafetyNote["severity"] }) {
  const colours: Record<string, string> = {
    critical: "#8a3835",
    high: "#7a5228",
    medium: "#6a6228",
    low: "#386450",
  };
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: "0.46rem",
        height: "0.46rem",
        borderRadius: "50%",
        background: colours[severity] ?? colours.low,
        marginRight: "0.45rem",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    />
  );
}

export default function MixtureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  const [pageState, setPageState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    const numericID = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;
    if (!numericID) {
      setPageState({ status: "not_found" });
      return;
    }
    let cancelled = false;
    getMixture(numericID).then((mixture) => {
      if (cancelled) return;
      setPageState(mixture ? { status: "ready", mixture } : { status: "not_found" });
    });
    return () => { cancelled = true; };
  }, [rawId]);

  if (pageState.status === "loading") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell" style={{ maxWidth: 780 }}>
          <article className="gaia-card gaia-loading-card">
            <h2>Loading elixir...</h2>
            <p className="gaia-note">Fetching botanical blend details.</p>
          </article>
        </section>
      </main>
    );
  }

  if (pageState.status === "not_found") {
    return (
      <main className="gaia-page">
        <section className="gaia-shell" style={{ maxWidth: 780 }}>
          <article className="gaia-card">
            <h2>Blend not found</h2>
            <p>This botanical blend could not be loaded. Return to your support plan.</p>
            <div className="gaia-actions" style={{ marginTop: "0.75rem" }}>
              <button type="button" className="gaia-btn gaia-btn-primary" onClick={() => router.back()}>
                Go back
              </button>
            </div>
          </article>
        </section>
      </main>
    );
  }

  const { mixture } = pageState;
  const hasHerbs = mixture.herbs && mixture.herbs.length > 0;
  const hasSafetyNotes = mixture.safetyNotes && mixture.safetyNotes.length > 0;
  const steps = mixture.instructions ? parseSteps(mixture.instructions) : [];

  return (
    <main className="gaia-page">
      <section className="gaia-shell" style={{ maxWidth: 780 }}>

        {/* ── Header ── */}
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Botanical Elixir</p>
          <h1>{mixture.mixtureName}</h1>
          <p>{mixture.purpose}</p>
          <div className="gaia-chip-row">
            {hasHerbs && (
              <span className="gaia-chip">
                {mixture.herbs.length} botanical{mixture.herbs.length !== 1 ? "s" : ""}
              </span>
            )}
            {mixture.dosage && (
              <span className="gaia-chip">Dosage included</span>
            )}
          </div>
        </header>

        {/* ── Botanicals / Ingredients ── */}
        {hasHerbs && (
          <article className="gaia-card gaia-elixir-card">
            <div className="gaia-section-title">
              <h2>Botanicals</h2>
              <span className="gaia-section-kicker">Ingredients</span>
            </div>
            <hr className="gaia-divider" />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.6rem" }}>
              {mixture.herbs.map((herb) => (
                <li
                  key={herb.herbID}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.5rem",
                    padding: "0.55rem 0.7rem",
                    borderRadius: "var(--gaia-radius-sm)",
                    background: "rgba(72,140,96,0.06)",
                    border: "1px solid rgba(72,140,96,0.1)",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: "var(--gaia-sage-500)", flexShrink: 0 }}>◆</span>
                  <span>
                    <strong>{herb.herbName}</strong>
                    {herb.latinName && (
                      <span className="gaia-note"> — {herb.latinName}</span>
                    )}
                    {(herb.amount != null || herb.unit) && (
                      <span className="gaia-note">
                        {" · "}
                        {[herb.amount, herb.unit].filter(Boolean).join(" ")}
                      </span>
                    )}
                    <RoleBadge role={herb.role} />
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )}

        {/* ── Preparation ── */}
        {steps.length > 0 && (
          <article className="gaia-card gaia-surface-muted">
            <div className="gaia-section-title">
              <h2>Preparation</h2>
              <span className="gaia-section-kicker">How to make</span>
            </div>
            <hr className="gaia-divider" />
            {steps.length === 1 ? (
              <p>{steps[0]}</p>
            ) : (
              <ol style={{ display: "grid", gap: "0.5rem" }}>
                {steps.map((step, i) => (
                  <li key={i} style={{ lineHeight: 1.72 }}>{step}</li>
                ))}
              </ol>
            )}
          </article>
        )}

        {/* ── Dosage ── */}
        {mixture.dosage && (
          <article className="gaia-card" style={{
            borderColor: "rgba(148,112,48,0.22)",
            background: "linear-gradient(155deg, rgba(255,252,238,0.99) 0%, rgba(252,246,224,0.97) 100%)",
            borderLeft: "4px solid var(--gaia-earth-400)",
            borderRadius: "0 var(--gaia-radius) var(--gaia-radius) 0",
          }}>
            <div className="gaia-section-title">
              <h2>Dosage</h2>
              <span className="gaia-section-kicker">How to use</span>
            </div>
            <p style={{ fontSize: "1.05rem", color: "var(--gaia-ink-800)", fontWeight: 500 }}>
              {mixture.dosage}
            </p>
          </article>
        )}

        {/* ── Safety & Precautions ── */}
        {hasSafetyNotes && (
          <article className="gaia-card gaia-precautions-card">
            <div className="gaia-section-title">
              <h2>Safety &amp; Precautions</h2>
              <span className="gaia-section-kicker">Before you start</span>
            </div>
            <hr className="gaia-divider" />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
              {mixture.safetyNotes.map((note) => (
                <li key={note.safetyNoteID} style={{ display: "flex", alignItems: "flex-start", gap: "0.1rem" }}>
                  <SeverityPip severity={note.severity} />
                  <span className="gaia-note" style={{ flex: 1 }}>
                    {note.message}
                    {note.instructions && (
                      <span style={{ display: "block", marginTop: "0.2rem", fontStyle: "italic" }}>
                        {note.instructions}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )}

        {/* ── Disclaimer ── */}
        <article className="gaia-card gaia-disclaimer">
          <p>
            <strong>Supportive use only —</strong> This botanical blend is wellness
            guidance, not medical treatment. Do not replace prescribed care. Consult your
            clinician before starting any new supplement routine, particularly if you are
            on medication or have an existing medical condition.
          </p>
        </article>

        {/* ── Navigation ── */}
        <div className="gaia-results-nav">
          <button
            type="button"
            className="gaia-btn gaia-btn-secondary"
            onClick={() => router.back()}
          >
            ← Back to plan
          </button>
          <Link href="/search" className="gaia-btn gaia-btn-ghost">
            Search conditions
          </Link>
        </div>

      </section>
    </main>
  );
}

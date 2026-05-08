"use client";

import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  return (
    <main className="gs-screen" aria-label="Gaia opening experience">

      {/* ── Deep atmosphere ── */}
      <div className="gs-bg-orb"  aria-hidden />
      <div className="gs-bg-gold" aria-hidden />

      {/* ── Firefly particles ── */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className={`gs-firefly gs-ff-${i + 1}`} aria-hidden />
      ))}

      {/* ── Botanical corner frame ── */}
      <svg
        className="gs-botanical-frame"
        viewBox="0 0 1000 680"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        fill="none"
      >
        <g opacity="0.9">
          <path d="M 0 0 C 50 28, 72 68, 52 108" stroke="rgba(118,192,128,0.32)" strokeWidth="1.3"/>
          <path d="M 0 0 C 28 48, 20 96, 0 126"   stroke="rgba(118,192,128,0.24)" strokeWidth="1"/>
          <path d="M 52 108 C 38 86, 44 58, 65 48" fill="rgba(85,152,98,0.16)" stroke="rgba(118,192,128,0.34)" strokeWidth="0.9"/>
          <path d="M 28 82 C 12 62, 6 38, 22 20"   fill="rgba(85,152,98,0.13)" stroke="rgba(118,192,128,0.28)" strokeWidth="0.8"/>
          <path d="M 65 48 C 82 32, 100 18, 122 8"  stroke="rgba(118,192,128,0.22)" strokeWidth="0.8"/>
          <circle cx="52" cy="108" r="2.5" fill="rgba(165,225,140,0.5)"/>
        </g>
        <g opacity="0.9" transform="translate(1000,0) scale(-1,1)">
          <path d="M 0 0 C 50 28, 72 68, 52 108" stroke="rgba(118,192,128,0.32)" strokeWidth="1.3"/>
          <path d="M 0 0 C 28 48, 20 96, 0 126"   stroke="rgba(118,192,128,0.24)" strokeWidth="1"/>
          <path d="M 52 108 C 38 86, 44 58, 65 48" fill="rgba(85,152,98,0.16)" stroke="rgba(118,192,128,0.34)" strokeWidth="0.9"/>
          <path d="M 28 82 C 12 62, 6 38, 22 20"   fill="rgba(85,152,98,0.13)" stroke="rgba(118,192,128,0.28)" strokeWidth="0.8"/>
          <path d="M 65 48 C 82 32, 100 18, 122 8"  stroke="rgba(118,192,128,0.22)" strokeWidth="0.8"/>
          <circle cx="52" cy="108" r="2.5" fill="rgba(165,225,140,0.5)"/>
        </g>
        <g opacity="0.65" transform="translate(0,680) scale(1,-1)">
          <path d="M 0 0 C 50 28, 72 68, 52 108" stroke="rgba(118,192,128,0.24)" strokeWidth="1.1"/>
          <path d="M 0 0 C 28 48, 20 96, 0 126"   stroke="rgba(118,192,128,0.18)" strokeWidth="0.9"/>
          <path d="M 52 108 C 38 86, 44 58, 65 48" fill="rgba(85,152,98,0.12)" stroke="rgba(118,192,128,0.26)" strokeWidth="0.8"/>
        </g>
        <g opacity="0.65" transform="translate(1000,680) scale(-1,-1)">
          <path d="M 0 0 C 50 28, 72 68, 52 108" stroke="rgba(118,192,128,0.24)" strokeWidth="1.1"/>
          <path d="M 0 0 C 28 48, 20 96, 0 126"   stroke="rgba(118,192,128,0.18)" strokeWidth="0.9"/>
          <path d="M 52 108 C 38 86, 44 58, 65 48" fill="rgba(85,152,98,0.12)" stroke="rgba(118,192,128,0.26)" strokeWidth="0.8"/>
        </g>
        <line x1="48"  y1="340" x2="360" y2="340" stroke="rgba(118,192,128,0.13)" strokeWidth="0.7"/>
        <line x1="640" y1="340" x2="952" y2="340" stroke="rgba(118,192,128,0.13)" strokeWidth="0.7"/>
        <circle cx="500" cy="340" r="3.5" fill="none" stroke="rgba(158,218,138,0.35)" strokeWidth="0.8"/>
        <circle cx="500" cy="340" r="7"   fill="none" stroke="rgba(138,202,122,0.2)"  strokeWidth="0.6"/>
      </svg>

      {/* ── Composition stage — keeps Gaia and content in one coordinate system ── */}
      <div className="gs-stage">

        {/* ── Gaia central illustration ── */}
        <div className="gs-gaia-wrap" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/gaia_splash.png"
            alt=""
            className="gs-gaia-img"
            draggable={false}
          />
        </div>

        {/* ── Centre content ── */}
        <section className="gs-content">

        <h1 className="gs-wordmark" aria-label="G.A.I.A.">
          <span className="gs-letter" style={{ animationDelay: "0.52s" }}>G</span>
          <span className="gs-dot"    style={{ animationDelay: "0.76s" }}>.</span>
          <span className="gs-letter" style={{ animationDelay: "1.00s" }}>A</span>
          <span className="gs-dot"    style={{ animationDelay: "1.24s" }}>.</span>
          <span className="gs-letter" style={{ animationDelay: "1.48s" }}>I</span>
          <span className="gs-dot"    style={{ animationDelay: "1.72s" }}>.</span>
          <span className="gs-letter" style={{ animationDelay: "1.96s" }}>A</span>
          <span className="gs-dot"    style={{ animationDelay: "2.20s" }}>.</span>
        </h1>

        <p className="gs-full-name">Green AI Alchemy</p>

        <div className="gs-ornament" aria-hidden>
          <span className="gs-ornament-line" />
          <svg className="gs-ornament-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1 C8 1, 9.8 5, 8 8 C6.2 5, 8 1, 8 1Z"   fill="rgba(186,230,148,0.72)"/>
            <path d="M8 15 C8 15, 9.8 11, 8 8 C6.2 11, 8 15, 8 15Z" fill="rgba(186,230,148,0.72)"/>
            <path d="M1 8 C1 8, 5 6.2, 8 8 C5 9.8, 1 8, 1 8Z"   fill="rgba(186,230,148,0.72)"/>
            <path d="M15 8 C15 8, 11 6.2, 8 8 C11 9.8, 15 8, 15 8Z" fill="rgba(186,230,148,0.72)"/>
            <circle cx="8" cy="8" r="1.6" fill="rgba(200,168,78,0.82)"/>
          </svg>
          <span className="gs-ornament-line" />
        </div>

        <p className="gs-tagline">Supportive wellness · Natural recovery</p>

        <div className="gs-progress-track" aria-hidden>
          <div className="gs-progress-fill" />
        </div>

        <button
          type="button"
          className="gs-skip"
          onClick={() => router.replace("/entry")}
        >
          Enter Gaia
        </button>

        </section>

      </div>{/* end gs-stage */}

      {/* ── Motto ── */}
      <blockquote className="gs-motto" aria-label="Gaia motto">
        <span className="gs-motto-rule" aria-hidden />
        <span className="gs-motto-quote">&ldquo;You are what you eat&rdquo;</span>
        <cite className="gs-motto-cite">— Victor Lindlahr</cite>
      </blockquote>

    </main>
  );
}

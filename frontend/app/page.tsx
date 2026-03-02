import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>G.a.i.A. (MVP)</h1>
      <p style={{ lineHeight: 1.6 }}>
        Green AI Alchemy is a non-diagnostic wellness support system.
      </p>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link
          href="/search"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            textDecoration: "none",
          }}
        >
          Start Search →
        </Link>

        <a
          href="http://localhost:3000/api"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            textDecoration: "none",
          }}
        >
          Backend API status
        </a>
      </div>

      <hr style={{ margin: "28px 0" }} />

      <p style={{ color: "#666" }}>
        Workflow: Search → Match → Recommendations → Create Plan → Reminders
      </p>
    </main>
  );
}
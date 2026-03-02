import Link from "next/link";
import { apiGet } from "../../lib/api";

type Condition = {
  conditionID: number;
  conditionName: string;
  description: string | null;
  category: string | null;
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const q = (query || "").trim();

  if (!q) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <h1 style={{ fontSize: 28 }}>Results</h1>
        <p>No query provided.</p>
        <Link href="/search">Go back to search</Link>
      </main>
    );
  }

  // Calls your Express endpoint: GET /api/conditions?query=...
  let results: Condition[] = [];
  let error: string | null = null;

  try {
    results = await apiGet<Condition[]>(
      `/conditions?query=${encodeURIComponent(q)}`,
      { noStore: true }
    );
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load results";
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Results</h1>
      <p style={{ color: "#666" }}>
        Query: <b>{q}</b>
      </p>

      <div style={{ marginTop: 18, display: "flex", gap: 12 }}>
        <Link href="/search" style={{ textDecoration: "none" }}>
          ← New search
        </Link>
        <Link href="/" style={{ textDecoration: "none" }}>
          Home
        </Link>
      </div>

      <hr style={{ margin: "18px 0" }} />

      {error ? (
        <p style={{ color: "crimson" }}>Error: {error}</p>
      ) : results.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {results.map((c) => (
            <li
              key={c.conditionID}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{c.conditionName}</b>
                <span style={{ color: "#666" }}>{c.category || "—"}</span>
              </div>
              {c.description ? (
                <p style={{ marginTop: 8, marginBottom: 0, color: "#444" }}>
                  {c.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
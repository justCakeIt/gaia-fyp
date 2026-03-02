"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/results?query=${encodeURIComponent(q)}`);
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Search</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Type a condition name/synonym (example: liver, nafld, ibs).
      </p>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 10 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. liver"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      <div style={{ marginTop: 18 }}>
        <a href="/" style={{ textDecoration: "none" }}>
          ← Back
        </a>
      </div>
    </main>
  );
}
"use client";

import { useRouter } from "next/navigation";

export default function NavArrows() {
  const router = useRouter();
  return (
    <div className="gaia-nav-arrows" aria-label="Page navigation">
      <button
        type="button"
        className="gaia-nav-arrow"
        onClick={() => router.back()}
        aria-label="Go back"
        title="Back"
      >
        ←
      </button>
      <button
        type="button"
        className="gaia-nav-arrow"
        onClick={() => router.forward()}
        aria-label="Go forward"
        title="Forward"
      >
        →
      </button>
    </div>
  );
}

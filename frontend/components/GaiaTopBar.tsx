"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GaiaTopBar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status !== "authenticated") return null;

  const user = session?.user as { name?: string | null } | undefined;
  const firstName = user?.name?.split(" ")[0]?.trim() || "Member";

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/entry");
  }

  return (
    <div className="gaia-topbar" role="banner" aria-label="Session controls">
      <span className="gaia-topbar-brand">G.A.I.A.</span>
      <span className="gaia-topbar-sep" aria-hidden>|</span>
      <span className="gaia-topbar-name">{firstName}</span>
      <button
        type="button"
        className="gaia-btn gaia-btn-ghost gaia-topbar-btn"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  );
}

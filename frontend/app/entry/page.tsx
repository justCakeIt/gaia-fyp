"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import NavArrows from "@/components/NavArrows";

type Mode = "choice" | "login" | "register";
type LoadingState = "idle" | "login" | "register" | "google";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string };
type RegisteredUser = { userID: number; email: string; userName: string };

function EntryContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = searchParams.get("mode");
  const [mode, setMode] = useState<Mode>(
    initialMode === "login" || initialMode === "register" ? initialMode : "choice"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const isBusy = loadingState !== "idle";
  const authError = searchParams.get("error");
  const oauthErrorMessage =
    authError === "AccessDenied"
      ? "Google sign-in could not be completed. Check OAuth keys and callback URL setup."
      : authError === "Configuration"
        ? "Google sign-in is not configured yet. Add Google OAuth credentials and restart the frontend."
      : authError
        ? "Authentication failed. Please try again."
        : "";
  const displayError = error || oauthErrorMessage;

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/profile");
    }
  }, [router, status]);

  useEffect(() => {
    getProviders()
      .then((providers) => {
        setGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => setGoogleEnabled(false));
  }, []);

  if (status === "authenticated") return null;

  function continueAsGuest() {
    router.push("/overview?mode=guest");
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function isStrongPassword(value: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(value);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoadingState("login");
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Enter email and password.");
      setLoadingState("idle");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setLoadingState("idle");
      return;
    }

    const response = await signIn("credentials", {
      redirect: false,
      email: normalizedEmail,
      password,
    });

    if (response?.error) {
      setError("Invalid email or password. Please try again.");
      setLoadingState("idle");
      return;
    }

    router.push("/profile");
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoadingState("register");
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail || !password) {
      setError("Complete all fields.");
      setLoadingState("idle");
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      setLoadingState("idle");
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Password must include upper/lowercase letters and a number.");
      setLoadingState("idle");
      return;
    }

    try {
      const registerResponse = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
        }),
      });

      const registerPayload = (await registerResponse.json()) as
        | ApiOk<RegisteredUser>
        | ApiErr;

      if (!registerResponse.ok || !registerPayload.ok) {
        const serverMessage =
          "error" in registerPayload
            ? registerPayload.error
            : "Could not register account.";
        setError(serverMessage);
        setLoadingState("idle");
        return;
      }
    } catch {
      setError(
        "Unable to reach registration service. Please check your connection and backend status."
      );
      setLoadingState("idle");
      return;
    }

    const response = await signIn("credentials", {
      redirect: false,
      email: normalizedEmail,
      password,
    });

    if (response?.error) {
      setSuccess("Account created. Please log in with your new credentials.");
      setMode("login");
      setLoadingState("idle");
      return;
    }

    router.push("/profile");
  }

  async function handleGoogleAuth() {
    setError("");
    setSuccess("");

    if (!googleEnabled) {
      setError(
        "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then restart frontend."
      );
      return;
    }

    setLoadingState("google");
    const response = await signIn("google", { callbackUrl: "/profile" });
    if (response?.error) {
      setError("Google sign-in failed. Please try again.");
      setLoadingState("idle");
    }
  }

  return (
    <main className="gaia-page">
      <section className="gaia-shell gaia-auth-shell">
        <header className="gaia-header-card">
          <NavArrows />
          <p className="gaia-kicker">Gaia House</p>
          <h1>Welcome to G.A.I.A.</h1>
          <p>
            Calm, supportive wellness guidance shaped by botanical wisdom —
            designed to complement professional care, never replace it.
          </p>
          <div className="gaia-chip-row">
            <span className="gaia-chip">Botanical support</span>
            <span className="gaia-chip">Nature-led</span>
            <span className="gaia-chip">Safety-forward</span>
          </div>
        </header>

        <article className="gaia-card">
          {mode === "choice" && (
            <div className="gaia-auth-stack">
              <button
                type="button"
                className="gaia-btn gaia-btn-primary"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setMode("login");
                }}
                disabled={isBusy}
              >
                Log in
              </button>
              <button
                type="button"
                className="gaia-btn gaia-btn-secondary"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setMode("register");
                }}
                disabled={isBusy}
              >
                Create account
              </button>

              <div className="gaia-auth-or">or</div>

              <button
                type="button"
                className="gaia-btn gaia-btn-google"
                onClick={handleGoogleAuth}
                disabled={isBusy}
              >
                {loadingState === "google"
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </button>
              <button
                type="button"
                className="gaia-btn gaia-btn-ghost"
                onClick={continueAsGuest}
                disabled={isBusy}
              >
                Continue as Guest
              </button>
              {!googleEnabled ? (
                <div className="gaia-google-setup">
                  <p className="gaia-note gaia-google-setup-title">
                    Google sign-in is available — OAuth credentials not yet added.
                  </p>
                  <ul>
                    <li>
                      Add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to{" "}
                      <code>frontend/.env.local</code>
                    </li>
                    <li>
                      In Google Cloud Console → Credentials → Authorised redirect URIs, add:{" "}
                      <code>http://localhost:3001/api/auth/callback/google</code>
                      {" "}(laptop) and{" "}
                      <code>http://&lt;LAN-IP&gt;:3001/api/auth/callback/google</code>
                      {" "}(phone)
                    </li>
                    <li>Restart the frontend dev server after saving.</li>
                  </ul>
                </div>
              ) : null}
              {displayError ? <p className="gaia-error">{displayError}</p> : null}
            </div>
          )}

          {mode === "login" && (
            <form className="gaia-form-card" onSubmit={handleLogin}>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="gaia-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="gaia-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />

              {displayError ? <p className="gaia-error">{displayError}</p> : null}
              {success ? <p className="gaia-success">{success}</p> : null}

              <button className="gaia-btn gaia-btn-primary" disabled={isBusy}>
                {loadingState === "login" ? "Logging in..." : "Log in"}
              </button>
              <button
                type="button"
                className="gaia-btn gaia-btn-ghost"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setMode("choice");
                }}
                disabled={isBusy}
              >
                Back
              </button>
            </form>
          )}

          {mode === "register" && (
            <form className="gaia-form-card" onSubmit={handleRegister}>
              <label htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                className="gaia-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />

              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                className="gaia-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                className="gaia-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create password"
                autoComplete="new-password"
              />
              <p className="gaia-note">
                Use 8+ characters with upper/lowercase letters and a number.
              </p>

              {displayError ? <p className="gaia-error">{displayError}</p> : null}
              {success ? <p className="gaia-success">{success}</p> : null}

              <button className="gaia-btn gaia-btn-primary" disabled={isBusy}>
                {loadingState === "register"
                  ? "Creating account..."
                  : "Register"}
              </button>
              <button
                type="button"
                className="gaia-btn gaia-btn-ghost"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setMode("choice");
                }}
                disabled={isBusy}
              >
                Back
              </button>
            </form>
          )}
          <hr className="gaia-divider" />
          <div className="gaia-list-card gaia-surface-muted">
            <p>
              Your guidance is designed to support medically diagnosed conditions
              with practical daily wellness structure.
            </p>
          </div>
        </article>

        <p className="gaia-footnote">
          G.A.I.A. provides supportive guidance only and does not replace
          medical care.
        </p>
      </section>
    </main>
  );
}

export default function EntryPage() {
  return (
    <Suspense
      fallback={
        <main className="gaia-page">
          <section className="gaia-shell gaia-auth-shell">
            <article className="gaia-card">
              <h2>Loading...</h2>
              <p>Preparing your entry experience.</p>
            </article>
          </section>
        </main>
      }
    >
      <EntryContent />
    </Suspense>
  );
}

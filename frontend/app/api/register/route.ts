import { NextResponse } from "next/server";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

const AUTH_API_BASE =
  process.env.API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:3000/api";

export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }

  let response: Response;
  try {
    response = await fetch(`${AUTH_API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: String(body.name || ""),
        email: String(body.email || ""),
        password: String(body.password || ""),
      }),
      cache: "no-store",
    });
  } catch {
    // Network error — backend not reachable at all
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cannot reach the backend API. Make sure `docker compose up` is running and the backend is on port 3000.",
      },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    // Backend returned non-JSON (e.g. Express 404 HTML)
    return NextResponse.json(
      {
        ok: false,
        error: `Backend returned an unexpected response (HTTP ${response.status}). Check that auth routes are registered.`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(payload, { status: response.status });
}

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: string };

export async function apiGet<T>(
  path: string,
  opts?: { noStore?: boolean }
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: opts?.noStore ? "no-store" : "default",
  });

  const json = (await res.json()) as ApiOk<T> | ApiErr;

  if (!res.ok || (json as ApiErr).ok === false) {
    const msg = (json as ApiErr).error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return (json as ApiOk<T>).data;
}
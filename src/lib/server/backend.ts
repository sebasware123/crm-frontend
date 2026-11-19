import "server-only";

export function backendBaseUrl() {
  return (process.env.BACKEND_API_URL || "http://localhost:8080").replace(/\/$/, "");
}

export async function backendRequest(path: string, token: string, init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
	headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${backendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers
  });
}

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendBaseUrl } from "@/lib/server/backend";
import type { Session } from "@/types/crm";

type SessionResponse = { data: Session };
export type SessionState =
  | { status: "authenticated"; session: Session }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function getSessionState(): Promise<SessionState> {
  const token = (await cookies()).get("crm_session")?.value;
  if (!token) return { status: "unauthenticated" };

  try {
    const response = await fetch(`${backendBaseUrl()}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if ([401, 403, 404].includes(response.status)) return { status: "unauthenticated" };
    if (!response.ok) return { status: "unavailable" };
    const payload = (await response.json()) as SessionResponse;
    if (!payload.data?.user?.id || !payload.data?.organization?.id) return { status: "unavailable" };
    return { status: "authenticated", session: payload.data };
  } catch {
    return { status: "unavailable" };
  }
}

export async function requireSession() {
  const state = await getSessionState();
  if (state.status === "unauthenticated") redirect("/login");
  if (state.status === "unavailable") throw new Error("SESSION_SERVICE_UNAVAILABLE");
  return state.session;
}

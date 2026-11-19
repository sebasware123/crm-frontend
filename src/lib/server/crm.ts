import "server-only";

import { cookies } from "next/headers";
import { backendRequest } from "@/lib/server/backend";
import type { ApiEnvelope } from "@/types/crm";

export async function getCRMData<T>(path: string): Promise<T | null> {
  const token = (await cookies()).get("crm_session")?.value;
  if (!token) return null;
  try {
    const response = await backendRequest(`/api/v1/${path}`, token);
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiEnvelope<T>;
    return payload.data;
  } catch {
    return null;
  }
}

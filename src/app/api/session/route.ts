import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendBaseUrl } from "@/lib/server/backend";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_session")?.value;
  if (!token) return NextResponse.json({ error: { code: "unauthorized", message: "Inicia sesión" } }, { status: 401 });

  try {
    const response = await fetch(`${backendBaseUrl()}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    const payload = await response.json();
    if (!response.ok) {
      const result = NextResponse.json(payload, { status: response.status });
      if ([401, 403, 404].includes(response.status)) result.cookies.delete("crm_session");
      return result;
    }
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: { code: "backend_unavailable", message: "Servicio no disponible" } }, { status: 503 });
  }
}

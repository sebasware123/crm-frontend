import { NextRequest, NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/server/backend";

type AuthPayload = { data?: { token?: string; user?: unknown; organization?: unknown }; error?: unknown };

export async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (action !== "login" && action !== "register") {
    return NextResponse.json({ error: { message: "Ruta no encontrada" } }, { status: 404 });
  }

  let body: unknown;
  const contentType = request.headers.get("content-type") ?? "";
  const isFormSubmission = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
  try {
    body = isFormSubmission
      ? Object.fromEntries((await request.formData()).entries())
      : await request.json();
  } catch {
    return NextResponse.json({ error: { message: "JSON inválido" } }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendBaseUrl()}/api/v1/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store"
    });
    const payload = (await response.json()) as AuthPayload;
    if (!response.ok || !payload.data?.token) {
      return NextResponse.json(payload, { status: response.status });
    }

    const { token, ...publicData } = payload.data;
    const result = isFormSubmission
      ? new NextResponse(null, { status: 303, headers: { Location: "/dashboard" } })
      : NextResponse.json({ data: publicData }, { status: response.status });
    result.cookies.set("crm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24
    });
    return result;
  } catch {
    return NextResponse.json(
      { error: { code: "backend_unavailable", message: "No fue posible conectar con el servicio CRM" } },
      { status: 503 }
    );
  }
}

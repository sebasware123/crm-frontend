import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendBaseUrl } from "@/lib/server/backend";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  const token = (await cookies()).get("crm_session")?.value;
  if (!token) return NextResponse.json({ error: { code: "unauthorized", message: "Inicia sesión" } }, { status: 401 });

  const { path } = await context.params;
  const safePath = path.map((part) => encodeURIComponent(part)).join("/");
  const target = `${backendBaseUrl()}/api/v1/${safePath}${request.nextUrl.search}`;
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
      cache: "no-store"
    });
    if (upstream.status === 204) return new NextResponse(null, { status: 204 });
    const responseHeaders: Record<string, string> = {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json"
    };
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) responseHeaders["Content-Disposition"] = disposition;
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    });
  } catch {
    return NextResponse.json({ error: { code: "backend_unavailable", message: "Servicio no disponible" } }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

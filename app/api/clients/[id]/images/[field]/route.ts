import { auth } from "@/auth/auth";
import { NextResponse } from "next/server";

const IMAGE_FIELDS = new Set(["photo", "nid_front", "nid_back"]);
const CLIENT_ID = /^[0-9a-fA-F-]{36}$/;

function sessionToken(session: unknown): string | null {
  if (!session || typeof session !== "object" || !("token" in session)) return null;
  const token = session.token;
  return typeof token === "string" && token !== "" ? token : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; field: string }> },
) {
  const { id, field } = await context.params;
  if (!CLIENT_ID.test(id) || !IMAGE_FIELDS.has(field)) {
    return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
  }

  const token = sessionToken(await auth());
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  }

  const apiBase = process.env.NEXTAPI_URL;
  if (!apiBase) {
    return NextResponse.json({ success: false, message: "API is not configured" }, { status: 500 });
  }

  const upstream = await fetch(`${apiBase}/api/v1/clients/${id}/images/${field}`, {
    headers: {
      Accept: "image/*, application/json",
      Authorization: `Bearer ${token}`,
      "X-Requested-With": "XMLHttpRequest",
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    const body: unknown = await upstream.json().catch(() => ({
      success: false,
      message: "Image not found",
    }));
    return NextResponse.json(body, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ success: false, message: "Image not found" }, { status: 404 });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

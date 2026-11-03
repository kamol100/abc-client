import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getCompanyPublicData } from "@/lib/api/api";
import { isFaviconContentType, sameOriginFaviconUrl } from "@/lib/favicon/site-favicon";
import { resolveApiAssetUrl } from "@/lib/helper/helper";

const FALLBACK_PATH = path.join(process.cwd(), "public/static/favicon.png");
const MAX_FAVICON_BYTES = 512 * 1024;

export const dynamic = "force-dynamic";

function resolveHost(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-host");
  if (forwarded) return forwarded.split(":")[0] ?? "localhost";
  const host = request.headers.get("host");
  if (host) return host.split(":")[0] ?? "localhost";
  return "localhost";
}

function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API ?? process.env.NEXTAPI_URL ?? "").trim().replace(/\/$/, "");
}

function iconResponse(body: BodyInit, contentType: string): NextResponse {
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function fallbackIcon(): Promise<NextResponse> {
  const body = await readFile(FALLBACK_PATH);
  return iconResponse(new Uint8Array(body), "image/png");
}

export async function GET(request: NextRequest) {
  try {
    const company = await getCompanyPublicData(resolveHost(request));
    const target = sameOriginFaviconUrl(resolveApiAssetUrl(company?.favicon), apiOrigin());
    if (!target) return fallbackIcon();

    const image = await fetch(target, { next: { revalidate: 300 } });
    const contentType = image.headers.get("content-type");
    if (!image.ok || !isFaviconContentType(contentType)) return fallbackIcon();

    const body = await image.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_FAVICON_BYTES) return fallbackIcon();

    return iconResponse(body, contentType?.split(";")[0]?.trim() || "image/png");
  } catch {
    return fallbackIcon();
  }
}

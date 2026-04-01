import { NextRequest, NextResponse } from "next/server";

const BASE_URL = `${process.env.NEXTAPI_URL}/api/v1`;

function resolveHost(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-host");
  if (forwarded) return forwarded.split(":")[0];
  const host = request.headers.get("host");
  if (host) return host.split(":")[0];
  return "localhost";
}

export async function GET(request: NextRequest) {
  const host = resolveHost(request);

  let company: {
    name?: string;
    logo?: string;
    favicon?: string;
  } = {};

  try {
    const res = await fetch(`${BASE_URL}/api/company-data?host=${host}`, {
      headers: {
        "Content-type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    const json = await res.json();
    company = json?.data ?? {};
  } catch {
    // Fall back to defaults
  }

  const appName = company.name || "ISP Management";
  const icons = [];

  // Use tenant logo if available, otherwise use default SVG icons
  if (company.logo) {
    icons.push(
      { src: company.logo, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: company.logo, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: company.logo, sizes: "512x512", type: "image/png", purpose: "maskable" }
    );
  } else {
    icons.push(
      { src: "/pwa/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/pwa/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/pwa/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" }
    );
  }

  const manifest = {
    name: appName,
    short_name: appName.length > 12 ? appName.substring(0, 12) : appName,
    description: `${appName} - ISP Management System`,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    icons,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

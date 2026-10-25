import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isPublicPathname } from "@/lib/auth/public-routes";
import { resolveAuthGate } from "@/lib/auth/routes";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

const SYSTEM_PREFIXES = ["/api/", "/_next/", "/offline", "/static/"];

function isSystemRoute(pathname: string) {
  return SYSTEM_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function getAuthToken(req: NextRequest) {
  const isSecure =
    process.env.NODE_ENV === "production" ||
    req.headers.get("x-forwarded-proto") === "https";
  return getToken({ req, secret: authSecret, secureCookie: isSecure });
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isSystemRoute(pathname)) return NextResponse.next();

  const token = await getAuthToken(req);
  const isAuthenticated = Boolean((token as Record<string, unknown>)?.token);
  const decision = resolveAuthGate({
    pathname,
    search,
    isAuthenticated,
    isPublicPath: isPublicPathname(pathname),
  });

  if (decision.action === "next") return NextResponse.next();

  const target = new URL(decision.pathname, req.url);
  target.search = decision.search;
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$).*)"],
};

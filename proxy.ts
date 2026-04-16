import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

const ADMIN_LOGIN = "/admin";
const LEGACY_LOGIN = "/login";
const ADMIN_DASHBOARD = "/dashboard";
const CLIENT_LOGIN = "/client/login";
const CLIENT_DASHBOARD = "/client/dashboard";

const PUBLIC_ROUTES = new Set(["/", ADMIN_LOGIN, CLIENT_LOGIN]);

const SYSTEM_PREFIXES = ["/api/", "/_next/", "/offline", "/static/"];

function isSystemRoute(pathname: string) {
  return SYSTEM_PREFIXES.some((p) => pathname.startsWith(p));
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

  // Legacy /login → /admin
  if (pathname === LEGACY_LOGIN) {
    const target = new URL(ADMIN_LOGIN, req.url);
    target.search = search;
    return NextResponse.redirect(target);
  }

  const token = await getAuthToken(req);
  const isAuthenticated = Boolean((token as Record<string, unknown>)?.token);

  const isClientRoute = pathname.startsWith("/client/");
  const isAdminDashboardRoute = pathname.startsWith("/dashboard");

  // ── CLIENT ROUTES ─────────────────────────────────────────────────────────
  if (isClientRoute) {
    if (pathname === CLIENT_LOGIN) {
      return isAuthenticated
        ? NextResponse.redirect(new URL(CLIENT_DASHBOARD, req.url))
        : NextResponse.next();
    }

    if (!isAuthenticated) {
      const loginUrl = new URL(CLIENT_LOGIN, req.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── ADMIN / DASHBOARD ROUTES ──────────────────────────────────────────────
  if (pathname === ADMIN_LOGIN) {
    return isAuthenticated
      ? NextResponse.redirect(new URL(ADMIN_DASHBOARD, req.url))
      : NextResponse.next();
  }

  if (pathname === "/" || pathname === "") {
    return isAuthenticated
      ? NextResponse.redirect(new URL(ADMIN_DASHBOARD, req.url))
      : NextResponse.next();
  }

  if (isAdminDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL(ADMIN_LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!PUBLIC_ROUTES.has(pathname) && !isAuthenticated) {
    const loginUrl = new URL(ADMIN_LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$).*)"],
};

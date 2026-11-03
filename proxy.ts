import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isPublicPathname } from "@/lib/auth/public-routes";
import { resolveAuthGate } from "@/lib/auth/routes";
import { hostnameHasTenantSubdomain } from "@/lib/helper/helper";
import { LANGUAGE_COOKIE } from "@/lib/i18n/languages";

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

/* The marketing site opens in Bangla until the visitor picks a language. The cookie is only filled in for this request,
   never stored, so the admin and the customer portal keep DEFAULT_LANGUAGE for anyone who has not chosen. */
const MARKETING_PATHS = ["/home", "/features", "/pricing", "/demo-request", "/about", "/faq"];
const MARKETING_LANGUAGE = "bn";

function next(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const marketing = pathname === "/" || MARKETING_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!marketing || req.cookies.has(LANGUAGE_COOKIE) || hostnameHasTenantSubdomain(req.headers.get("host")?.split(":")[0])) {
    return NextResponse.next();
  }
  req.cookies.set(LANGUAGE_COOKIE, MARKETING_LANGUAGE);
  const headers = new Headers(req.headers);
  headers.set("cookie", req.cookies.toString());
  return NextResponse.next({ request: { headers } });
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

  if (decision.action === "next") return next(req);

  const target = new URL(decision.pathname, req.url);
  target.search = decision.search;
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$).*)"],
};

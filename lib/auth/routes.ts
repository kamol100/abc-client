export const ADMIN_LOGIN_PATH = "/admin";
export const ADMIN_DASHBOARD_PATH = "/dashboard";
export const CLIENT_LOGIN_PATH = "/login";

/** Login on the host the subscriber is already using. Auth.js otherwise prefixes `/login` with `AUTH_URL`. */
export function clientLoginUrl(origin: string): string {
  return new URL(CLIENT_LOGIN_PATH, origin).href;
}
export const LEGACY_CLIENT_LOGIN_PATH = "/client/login";
export const CLIENT_DASHBOARD_PATH = "/client/dashboard";

export type AuthGateResult =
  | { action: "next" }
  | { action: "redirect"; pathname: string; search: string };

function redirectTo(pathname: string, search = ""): AuthGateResult {
  return { action: "redirect", pathname, search };
}

function redirectToLogin(loginPath: string, pathname: string, search: string): AuthGateResult {
  const params = new URLSearchParams();
  params.set("callbackUrl", `${pathname}${search}`);
  return redirectTo(loginPath, `?${params.toString()}`);
}

/** Where the request gate should send this path. Staff routes stay on `/admin`. */
export function resolveAuthGate(input: {
  pathname: string;
  search: string;
  isAuthenticated: boolean;
  isPublicPath: boolean;
}): AuthGateResult {
  const { pathname, search, isAuthenticated, isPublicPath } = input;

  // `/login` is the subscriber form. Do not bounce an existing session into the
  // client portal: a staff cookie would fail `/client-profile` and be cleared.
  if (pathname === LEGACY_CLIENT_LOGIN_PATH) {
    return redirectTo(CLIENT_LOGIN_PATH, search);
  }

  if (pathname === CLIENT_LOGIN_PATH) {
    return { action: "next" };
  }

  if (pathname.startsWith("/client/")) {
    return isAuthenticated
      ? { action: "next" }
      : redirectToLogin(CLIENT_LOGIN_PATH, pathname, search);
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    return isAuthenticated ? redirectTo(ADMIN_DASHBOARD_PATH) : { action: "next" };
  }

  if (pathname === "/" || pathname === "") {
    return isAuthenticated ? redirectTo(ADMIN_DASHBOARD_PATH) : { action: "next" };
  }

  if (pathname.startsWith(ADMIN_DASHBOARD_PATH) && !isAuthenticated) {
    return redirectToLogin(ADMIN_LOGIN_PATH, pathname, search);
  }

  if (!isPublicPath && !isAuthenticated) {
    return redirectToLogin(ADMIN_LOGIN_PATH, pathname, search);
  }

  return { action: "next" };
}

/** Client session expiry must land on the subscriber login. Everything else stays on staff login. */
export function sessionExpiredPath(requested: string | null): string {
  if (requested === CLIENT_LOGIN_PATH || requested === LEGACY_CLIENT_LOGIN_PATH) {
    return CLIENT_LOGIN_PATH;
  }
  return ADMIN_LOGIN_PATH;
}

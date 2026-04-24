const PUBLIC_EXACT_PATHS = new Set(["/", "/offline"]);
/** URL prefixes for `app/(public)` pages (the `(public)` segment is not in the path). Add a prefix when you add a route there. */
const PUBLIC_PREFIX_PATHS = ["/home", "/features", "/pricing", "/demo-request", "/pay", "/api/manifest"];

function isPrefixPathMatch(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPublicPathname(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIX_PATHS.some((prefix) => isPrefixPathMatch(pathname, prefix));
}

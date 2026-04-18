const PUBLIC_EXACT_PATHS = new Set(["/", "/offline"]);
const PUBLIC_PREFIX_PATHS = ["/pay", "/api/manifest"];

function isPrefixPathMatch(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPublicPathname(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIX_PATHS.some((prefix) => isPrefixPathMatch(pathname, prefix));
}

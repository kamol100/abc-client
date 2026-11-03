const FAVICON_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/svg+xml",
]);

export function isFaviconContentType(value: string | null | undefined): boolean {
  const type = value?.split(";")[0]?.trim().toLowerCase() ?? "";
  return FAVICON_CONTENT_TYPES.has(type);
}

/** Only proxy a favicon that already lives on the API origin. */
export function sameOriginFaviconUrl(
  assetUrl: string | null | undefined,
  apiOrigin: string,
): string | null {
  const origin = apiOrigin.trim().replace(/\/$/, "");
  const asset = assetUrl?.trim();
  if (!origin || !asset) return null;

  try {
    const assetUrlParsed = new URL(asset);
    const originUrl = new URL(origin);
    if (assetUrlParsed.origin !== originUrl.origin) return null;
    if (assetUrlParsed.protocol !== "http:" && assetUrlParsed.protocol !== "https:") return null;
    return assetUrlParsed.href;
  } catch {
    return null;
  }
}

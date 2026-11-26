const VERSION_PATTERN = /^v\d+$/;

/**
 * Builds the Laravel URL for the read proxy (`/api/proxy/{version}/{...path}`).
 * Returns null when the base URL is missing, the version is not like `v1`, or a segment would leave the
 * versioned API (`.`, `..`, empty), so the proxy can only reach `{NEXTAPI_URL}/api/{version}/…`.
 */
export function buildApiProxyUrl(baseUrl: string | undefined, segments: string[] | undefined, search = ""): string | null {
    if (!baseUrl || !segments || segments.length < 2) return null;

    const [version, ...rest] = segments;
    if (!VERSION_PATTERN.test(version)) return null;
    if (rest.some((segment) => segment === "" || segment === "." || segment === "..")) return null;

    const base = baseUrl.replace(/\/+$/, "");
    const path = rest.map((segment) => encodeURIComponent(segment)).join("/");
    const query = search && !search.startsWith("?") ? `?${search}` : search;
    return `${base}/api/${version}/${path}${query}`;
}

/** The browser-side URL of the read proxy for an API path such as `clients/12?page=1`. */
export function apiProxyPath(url: string, version = "v1"): string {
    const normalized = url.startsWith("/") ? url : `/${url}`;
    return `/api/proxy/${version.trim()}${normalized}`;
}

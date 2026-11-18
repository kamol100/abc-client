import type { HelpArticlePolicy } from "@/content/help/catalog";

const SEGMENT = /^[A-Za-z0-9_-]+$/;
const PARAM = /^:[a-z]+$/;

export function routeSpecificity(pattern: string): number {
  const parts = pattern.split("/").filter(Boolean);
  const params = parts.filter((part) => part.startsWith(":")).length;
  return parts.length * 10 - params;
}

export function normalizeHelpPath(value: string): string | null {
  const path = value.split("?")[0]?.split("#")[0] ?? "";
  if (!path.startsWith("/") || path.includes("\\") || path.includes("..")) return null;
  if (path.length > 200) return null;
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export function routeMatches(pattern: string, pathname: string): boolean {
  const path = normalizeHelpPath(pathname);
  if (!path) return false;
  const wanted = pattern.split("/").filter(Boolean);
  const actual = path.split("/").filter(Boolean);
  if (wanted.length !== actual.length) return false;
  return wanted.every((part, index) => {
    if (part.startsWith(":")) return PARAM.test(part) && SEGMENT.test(actual[index] ?? "");
    return part === actual[index];
  });
}

export function isValidRoutePattern(pattern: string): boolean {
  if (!pattern.startsWith("/") || pattern.includes("?") || pattern.includes("#") || pattern.includes("..")) {
    return false;
  }
  const parts = pattern.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  return parts.every((part) => /^[a-z0-9-]+$/.test(part) || PARAM.test(part));
}

export function matchingHelpArticles(
  articles: readonly HelpArticlePolicy[],
  pathname: string,
): HelpArticlePolicy[] {
  return articles
    .filter((article) => article.routePatterns.some((pattern) => routeMatches(pattern, pathname)))
    .sort((left, right) => {
      const leftScore = Math.max(
        ...left.routePatterns.filter((pattern) => routeMatches(pattern, pathname)).map(routeSpecificity),
      );
      const rightScore = Math.max(
        ...right.routePatterns.filter((pattern) => routeMatches(pattern, pathname)).map(routeSpecificity),
      );
      return rightScore - leftScore || left.sortOrder - right.sortOrder;
    });
}

export function indexHelpArticles(articles: readonly HelpArticlePolicy[]): {
  byId: Map<string, HelpArticlePolicy>;
  bySlug: Map<string, HelpArticlePolicy>;
} {
  const byId = new Map<string, HelpArticlePolicy>();
  const bySlug = new Map<string, HelpArticlePolicy>();
  for (const article of articles) {
    byId.set(article.id, article);
    bySlug.set(article.slug, article);
  }
  return { byId, bySlug };
}

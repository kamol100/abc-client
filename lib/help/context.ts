import type { HelpArticlePolicy } from "@/content/help/catalog";
import { canReadHelpArticle, type HelpActor } from "@/lib/help/authorization";
import { matchingHelpArticles, routeMatches, routeSpecificity } from "@/lib/help/catalog";

export const GENERAL_HELP_IDS = [
  "support.getting-started",
  "support.contact",
  "support.faq.contact",
] as const;

function generalArticles(articles: readonly HelpArticlePolicy[]): HelpArticlePolicy[] {
  return GENERAL_HELP_IDS.flatMap((id) => articles.filter((article) => article.id === id));
}

function matchScore(article: HelpArticlePolicy, pathname: string): number {
  const scores = article.routePatterns
    .filter((pattern) => routeMatches(pattern, pathname))
    .map(routeSpecificity);
  return scores.length > 0 ? Math.max(...scores) : 0;
}

function relatedArticles(
  articles: readonly HelpArticlePolicy[],
  page: readonly HelpArticlePolicy[],
): HelpArticlePolicy[] {
  const pageIds = new Set(page.map((article) => article.id));
  return page.flatMap((article) => article.relatedIds.flatMap((id) => {
    const relatedArticle = articles.find((item) => item.id === id);
    if (!relatedArticle || pageIds.has(relatedArticle.id)) return [];
    return [relatedArticle];
  }));
}

export function selectHelpForRoute(
  articles: readonly HelpArticlePolicy[],
  pathname: string,
): { matched: boolean; page: HelpArticlePolicy[]; related: HelpArticlePolicy[] } {
  if (pathname.startsWith("/help/")) {
    const slug = pathname.slice("/help/".length);
    const article = articles.find((item) => item.slug === slug);
    if (article) {
      const page = [article];
      return { matched: true, page, related: relatedArticles(articles, page) };
    }
  }
  const matches = matchingHelpArticles(articles, pathname);
  if (matches.length === 0) return { matched: false, page: [], related: [] };
  const top = matchScore(matches[0], pathname);
  const page = matches.filter((article) => matchScore(article, pathname) === top);
  return { matched: true, page, related: relatedArticles(articles, page) };
}

export function readableHelpForRoute(
  actor: HelpActor,
  articles: readonly HelpArticlePolicy[],
  pathname: string,
  options?: { allowDrafts?: boolean },
): { matched: boolean; page: HelpArticlePolicy[]; related: HelpArticlePolicy[]; general: HelpArticlePolicy[] } {
  const selected = selectHelpForRoute(articles, pathname);
  const allow = (article: HelpArticlePolicy) => canReadHelpArticle(actor, article, options);
  const page = selected.page.filter(allow);
  const related = selected.related.filter(allow);
  if (selected.matched && page.length > 0) {
    return { matched: true, page, related, general: [] };
  }
  return {
    matched: false,
    page: [],
    related: [],
    general: generalArticles(articles).filter(allow),
  };
}

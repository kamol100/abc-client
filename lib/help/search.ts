import { helpTopicFor } from "@/lib/help/topics";
import type { HelpTopic } from "@/types/help-topic";
import type { HelpLocale } from "@/content/help/catalog";
import { canReadHelpArticle, type HelpActor } from "@/lib/help/authorization";
import { matchingHelpArticles, normalizeHelpPath } from "@/lib/help/catalog";
import { loadHelpDocument, type HelpDocument, type HelpLibrary } from "@/lib/help/content";
import { escapeHelpText } from "@/lib/help/render";

export const HELP_QUERY_MAX = 80;
export const HELP_RESULT_MAX = 8;
const SNIPPET = 160;

export interface HelpSearchHit {
  topic: HelpTopic;
  id: string;
  slug: string;
  kind: HelpDocument["article"]["kind"];
  locale: HelpLocale;
  title: string;
  summary: string;
  snippet: string;
}

export function normalizeHelpQuery(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/\s+/g, " ")
    .trim();
}

function fold(value: string): string {
  return normalizeHelpQuery(value);
}

function snippet(text: string, query: string): string {
  const folded = fold(text);
  const needle = fold(query);
  const index = needle ? folded.indexOf(needle) : -1;
  if (index < 0 || folded.length !== text.length) {
    return escapeHelpText(text.slice(0, SNIPPET));
  }
  const start = Math.max(0, index - 40);
  const slice = text.slice(start, start + SNIPPET);
  return escapeHelpText(start > 0 ? `…${slice}` : slice);
}

function score(document: HelpDocument, query: string, routeIds: ReadonlySet<string>): number {
  const needle = fold(query);
  const haystack = fold(`${document.title} ${document.summary} ${document.keywords.join(" ")} ${document.text}`);
  if (!needle || !haystack.includes(needle)) return 0;
  let value = 50;
  if (routeIds.has(document.article.id)) value += 1000;
  if (fold(document.title).includes(needle)) value += 500;
  if (document.keywords.some((keyword) => fold(keyword).includes(needle))) value += 200;
  if (fold(document.summary).includes(needle)) value += 100;
  return value;
}

export function visibleHelpDocuments(
  library: HelpLibrary,
  actor: HelpActor,
  locale: HelpLocale,
): HelpDocument[] {
  return library.articles.flatMap((article) => {
    if (!canReadHelpArticle(actor, article, { allowDrafts: library.allowDrafts })) return [];
    const document = loadHelpDocument(library, article, locale);
    return document ? [document] : [];
  });
}

export function searchHelpDocuments(
  documents: readonly HelpDocument[],
  query: string,
  route: string | null,
): HelpSearchHit[] {
  const needle = normalizeHelpQuery(query);
  if (!needle) return [];
  const path = route ? normalizeHelpPath(route) : null;
  const routeIds = new Set(
    path ? matchingHelpArticles(documents.map((document) => document.article), path).map((article) => article.id) : [],
  );
  return documents
    .map((document) => ({ document, rank: score(document, needle, routeIds) }))
    .filter((item) => item.rank > 0)
    .sort((left, right) => right.rank - left.rank || left.document.article.sortOrder - right.document.article.sortOrder)
    .slice(0, HELP_RESULT_MAX)
    .map(({ document, rank }) => {
      const titleMatch = fold(document.title).includes(fold(needle));
      const source = titleMatch ? document.summary : `${document.title} ${document.text}`;
      return {
        id: document.article.id,
        topic: helpTopicFor(document.article),
        slug: document.article.slug,
        kind: document.article.kind,
        locale: document.locale,
        title: document.title,
        summary: document.summary,
        snippet: rank >= 500 && titleMatch ? escapeHelpText(document.summary) : snippet(source, needle),
      };
    });
}

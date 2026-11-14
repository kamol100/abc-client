import { helpTopicFor } from "@/lib/help/topics";
import type { HelpTopic } from "@/types/help-topic";
import type { HelpArticlePolicy, HelpLocale } from "@/content/help/catalog";
import { canReadHelpArticle, type HelpActor } from "@/lib/help/authorization";
import { indexHelpArticles, normalizeHelpPath } from "@/lib/help/catalog";
import { readableHelpForRoute } from "@/lib/help/context";
import { loadHelpDocument, readHelpMedia, type HelpLibrary } from "@/lib/help/content";
import { helpHeadings, type HelpHeading } from "@/lib/help/headings";
import { renderHelpMarkdown } from "@/lib/help/render";
import { HELP_QUERY_MAX, searchHelpDocuments, visibleHelpDocuments } from "@/lib/help/search";
import { helpVideoEmbed } from "@/lib/help/video";

const PRIVATE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  Vary: "Cookie",
};

const MEDIA_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export interface HelpRequestDeps {
  actor: HelpActor;
  library: HelpLibrary;
}

function json(body: unknown, status: number, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...PRIVATE_HEADERS, ...extra } });
}

function hidden(): Response {
  return json({ success: false, code: "not_found" }, 404);
}

export function requestedHelpLocale(request: Request): HelpLocale | "invalid" | null {
  const query = new URL(request.url).searchParams.get("locale");
  if (query !== null) return query === "en" || query === "bn" ? query : "invalid";
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1] ?? "");
  return value === "en" || value === "bn" ? value : null;
}

function localeOrDefault(request: Request): HelpLocale | "invalid" {
  const locale = requestedHelpLocale(request);
  if (locale === "invalid") return "invalid";
  return locale ?? "en";
}

function allowedSlugs(library: HelpLibrary, actor: HelpActor): Map<string, string> {
  const slugs = new Map<string, string>();
  for (const article of library.articles) {
    if (canReadHelpArticle(actor, article, { allowDrafts: library.allowDrafts })) slugs.set(article.id, article.slug);
  }
  return slugs;
}

export interface HelpVideoView {
  id: string;
  spoken_locale: HelpLocale;
  src: string;
}

export interface HelpArticleView {
  id: string;
  slug: string;
  kind: HelpArticlePolicy["kind"];
  locale: HelpLocale;
  requested_locale: HelpLocale;
  fallback: boolean;
  title: string;
  summary: string;
  html: string;
  headings: HelpHeading[];
  video: HelpVideoView | null;
  video_status: "configured" | "not_configured";
  related: {
    id: string;
    slug: string;
    kind: HelpArticlePolicy["kind"];
    title: string;
    summary: string;
  }[];
  feature_href: string | null;
}

export interface HelpCard {
  topic: HelpTopic;
  id: string;
  slug: string;
  kind: HelpArticlePolicy["kind"];
  title: string;
  summary: string;
  video_status: "configured" | "not_configured";
}

function videoView(article: HelpArticlePolicy, locale: HelpLocale): Pick<HelpArticleView, "video" | "video_status"> {
  const own = article.videos?.[locale];
  const otherLocale: HelpLocale = locale === "bn" ? "en" : "bn";
  const spoken = own ? locale : otherLocale;
  const embed = helpVideoEmbed(own ?? article.videos?.[otherLocale]);
  if (!embed) return { video: null, video_status: "not_configured" };
  return { video: { id: embed.id, spoken_locale: spoken, src: embed.src }, video_status: "configured" };
}

export function helpArticleView(
  library: HelpLibrary,
  actor: HelpActor,
  article: HelpArticlePolicy,
  locale: HelpLocale,
): HelpArticleView | null {
  const document = loadHelpDocument(library, article, locale);
  if (!document) return null;
  const slugs = allowedSlugs(library, actor);
  let html = "";
  try {
    html = renderHelpMarkdown(document.body, article.id, slugs);
  } catch {
    return null;
  }
  const related = article.relatedIds.flatMap((id) => {
    const relatedArticle = library.articles.find((item) => item.id === id);
    if (!relatedArticle || !slugs.has(id)) return [];
    const relatedDocument = loadHelpDocument(library, relatedArticle, document.locale);
    if (!relatedDocument) return [];
    return [{
      id: relatedArticle.id,
      slug: relatedArticle.slug,
      kind: relatedArticle.kind,
      title: relatedDocument.title,
      summary: relatedDocument.summary,
    }];
  });
  const feature = article.routePatterns.find((pattern) => !pattern.includes(":"));
  return {
    id: article.id,
    slug: article.slug,
    kind: article.kind,
    locale: document.locale,
    requested_locale: document.requestedLocale,
    fallback: document.fallback,
    title: document.title,
    summary: document.summary,
    html,
    headings: helpHeadings(document.body),
    ...videoView(article, document.locale),
    related,
    feature_href: feature ?? null,
  };
}

function helpCard(
  library: HelpLibrary,
  actor: HelpActor,
  article: HelpArticlePolicy,
  locale: HelpLocale,
): HelpCard | null {
  if (!canReadHelpArticle(actor, article, { allowDrafts: library.allowDrafts })) return null;
  const document = loadHelpDocument(library, article, locale);
  if (!document) return null;
  return {
    id: article.id,
    topic: helpTopicFor(article),
    slug: article.slug,
    kind: article.kind,
    title: document.title,
    summary: document.summary,
    video_status: videoView(article, document.locale).video_status,
  };
}

export async function helpArticleResponse(request: Request, id: string, deps: HelpRequestDeps): Promise<Response> {
  if (deps.actor.principal !== "staff") return json({ success: false, code: "unauthenticated" }, 401);
  const locale = localeOrDefault(request);
  if (locale === "invalid" || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(id)) return hidden();
  const article = indexHelpArticles(deps.library.articles).byId.get(id);
  if (!article || !canReadHelpArticle(deps.actor, article, { allowDrafts: deps.library.allowDrafts })) return hidden();
  const data = helpArticleView(deps.library, deps.actor, article, locale);
  if (!data) return hidden();
  return json({ success: true, data }, 200);
}

export async function helpSearchResponse(request: Request, deps: HelpRequestDeps): Promise<Response> {
  if (deps.actor.principal !== "staff") return json({ success: false, code: "unauthenticated" }, 401);
  const locale = localeOrDefault(request);
  if (locale === "invalid") return hidden();
  const params = new URL(request.url).searchParams;
  const query = params.get("q") ?? "";
  if (query.length > HELP_QUERY_MAX) return json({ success: false, code: "invalid_query" }, 400);
  const documents = visibleHelpDocuments(deps.library, deps.actor, locale);
  const results = searchHelpDocuments(documents, query, params.get("route"));
  return json({ success: true, data: { results } }, 200);
}

export async function helpContextResponse(request: Request, deps: HelpRequestDeps): Promise<Response> {
  if (deps.actor.principal !== "staff") return json({ success: false, code: "unauthenticated" }, 401);
  const locale = localeOrDefault(request);
  if (locale === "invalid") return hidden();
  const route = new URL(request.url).searchParams.get("route") ?? "/";
  const path = normalizeHelpPath(route);
  const selection = readableHelpForRoute(
    deps.actor,
    deps.library.articles,
    path ?? "/",
    { allowDrafts: deps.library.allowDrafts },
  );
  const cards = (articles: readonly HelpArticlePolicy[]) => articles.flatMap((article) => {
    const card = helpCard(deps.library, deps.actor, article, locale);
    return card ? [card] : [];
  });
  return json({
    success: true,
    data: {
      matched: selection.matched,
      path,
      page: cards(selection.page),
      related: cards(selection.related),
      general: cards(selection.general),
    },
  }, 200);
}

export async function helpMediaResponse(
  articleId: string,
  file: string,
  deps: HelpRequestDeps,
): Promise<Response> {
  if (deps.actor.principal !== "staff") return json({ success: false, code: "unauthenticated" }, 401);
  const article = indexHelpArticles(deps.library.articles).byId.get(articleId);
  if (!article || !canReadHelpArticle(deps.actor, article, { allowDrafts: deps.library.allowDrafts })) return hidden();
  const bytes = readHelpMedia(deps.library.root, articleId, file);
  if (!bytes) return hidden();
  const extension = file.split(".").pop()?.toLowerCase() ?? "";
  const type = MEDIA_TYPES[extension];
  if (!type) return hidden();
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Disposition": `inline; filename="${file}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      Vary: "Cookie",
    },
  });
}

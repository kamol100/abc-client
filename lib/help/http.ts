import { readFileSync } from "node:fs";
import type { HelpArticlePolicy, HelpLocale } from "@/content/help/catalog";
import { canReadHelpArticle, type HelpActor } from "@/lib/help/authorization";
import { indexHelpArticles } from "@/lib/help/catalog";
import { loadHelpDocument, resolveHelpMedia, type HelpLibrary } from "@/lib/help/content";
import { renderHelpMarkdown } from "@/lib/help/render";
import { HELP_QUERY_MAX, searchHelpDocuments, visibleHelpDocuments } from "@/lib/help/search";

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

function articlePayload(
  library: HelpLibrary,
  actor: HelpActor,
  article: HelpArticlePolicy,
  locale: HelpLocale,
) {
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
  const video = article.videos?.[document.locale];
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
    video: video ? { id: video } : null,
    video_status: video ? "configured" : "not_configured",
    related,
  };
}

export async function helpArticleResponse(request: Request, id: string, deps: HelpRequestDeps): Promise<Response> {
  if (deps.actor.principal !== "staff") return json({ success: false, code: "unauthenticated" }, 401);
  const locale = localeOrDefault(request);
  if (locale === "invalid" || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(id)) return hidden();
  const article = indexHelpArticles(deps.library.articles).byId.get(id);
  if (!article || !canReadHelpArticle(deps.actor, article, { allowDrafts: deps.library.allowDrafts })) return hidden();
  const data = articlePayload(deps.library, deps.actor, article, locale);
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

export async function helpMediaResponse(
  articleId: string,
  file: string,
  deps: HelpRequestDeps,
): Promise<Response> {
  if (deps.actor.principal !== "staff") return json({ success: false, code: "unauthenticated" }, 401);
  const article = indexHelpArticles(deps.library.articles).byId.get(articleId);
  if (!article || !canReadHelpArticle(deps.actor, article, { allowDrafts: deps.library.allowDrafts })) return hidden();
  const media = resolveHelpMedia(deps.library.root, articleId, file);
  if (!media) return hidden();
  let bytes: Buffer;
  try {
    bytes = readFileSync(media);
  } catch {
    return hidden();
  }
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

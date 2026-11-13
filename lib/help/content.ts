import "server-only";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { HELP_ARTICLES, type HelpArticlePolicy, type HelpLocale } from "@/content/help/catalog";
import { parseHelpFrontMatter } from "@/lib/help/front-matter";
import { helpPlainText } from "@/lib/help/render";

export interface HelpLibrary {
  root: string;
  articles: readonly HelpArticlePolicy[];
  allowDrafts: boolean;
}

export interface HelpDocument {
  article: HelpArticlePolicy;
  locale: HelpLocale;
  requestedLocale: HelpLocale;
  fallback: boolean;
  title: string;
  summary: string;
  keywords: string[];
  body: string;
  text: string;
}

interface CachedDocument {
  revision: string;
  mtimeMs: number;
  document: HelpDocument;
}

const cache = new Map<string, CachedDocument>();

const ARTICLE_FILE = /^[a-z0-9]+(?:\/[a-z0-9-]+)*\.md$/;
const MEDIA_FILE = /^[a-z0-9][a-z0-9._-]{0,80}\.(?:png|jpe?g|webp|gif)$/;

export function projectHelpLibrary(allowDrafts = process.env.NODE_ENV !== "production"): HelpLibrary {
  return {
    root: path.join(process.cwd(), "content/help"),
    articles: HELP_ARTICLES,
    allowDrafts,
  };
}

export function resolveHelpFile(root: string, locale: string, file: string): string | null {
  if (locale !== "en" && locale !== "bn") return null;
  if (!ARTICLE_FILE.test(file)) return null;
  const rootResolved = path.resolve(root);
  const target = path.resolve(rootResolved, locale, file);
  const prefix = rootResolved.endsWith(path.sep) ? rootResolved : `${rootResolved}${path.sep}`;
  if (!target.startsWith(prefix)) return null;
  return target;
}

export function resolveHelpMedia(root: string, articleId: string, file: string): string | null {
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(articleId)) return null;
  if (!MEDIA_FILE.test(file) || file.includes("..")) return null;
  const rootResolved = path.resolve(root);
  const target = path.resolve(rootResolved, "media", articleId, file);
  const prefix = rootResolved.endsWith(path.sep) ? rootResolved : `${rootResolved}${path.sep}`;
  if (!target.startsWith(`${prefix}media${path.sep}`)) return null;
  return target;
}

function readLocale(library: HelpLibrary, article: HelpArticlePolicy, locale: HelpLocale): HelpDocument | null {
  const file = resolveHelpFile(library.root, locale, article.file);
  if (!file) return null;
  let mtimeMs = 0;
  try {
    mtimeMs = statSync(file).mtimeMs;
  } catch {
    return null;
  }
  const key = `${library.root}\n${locale}\n${article.id}\n${article.sourceRevision}`;
  const cached = cache.get(key);
  if (cached && cached.revision === article.sourceRevision && cached.mtimeMs === mtimeMs) {
    return cached.document;
  }
  let source = "";
  try {
    source = readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const parsed = parseHelpFrontMatter(source);
  if ("error" in parsed) return null;
  if (parsed.language !== locale || parsed.translatedFromRevision !== article.sourceRevision) return null;
  const document: HelpDocument = {
    article,
    locale,
    requestedLocale: locale,
    fallback: false,
    title: parsed.title,
    summary: parsed.summary,
    keywords: parsed.keywords,
    body: parsed.body,
    text: helpPlainText(parsed.body),
  };
  cache.set(key, { revision: article.sourceRevision, mtimeMs, document });
  return document;
}

export function loadHelpDocument(
  library: HelpLibrary,
  article: HelpArticlePolicy,
  requestedLocale: HelpLocale,
): HelpDocument | null {
  const primary = readLocale(library, article, requestedLocale);
  if (primary) return primary;
  if (
    requestedLocale === "bn"
    && article.publication === "draft"
    && article.developmentEnglishFallback === true
    && library.allowDrafts
  ) {
    const english = readLocale(library, article, "en");
    if (!english) return null;
    return { ...english, requestedLocale, fallback: true };
  }
  return null;
}

export function clearHelpContentCache(): void {
  cache.clear();
}

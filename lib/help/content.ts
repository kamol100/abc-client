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

function isProjectHelpRoot(root: string): boolean {
  return path.resolve(root) === path.resolve(process.cwd(), "content/help");
}

function relativeInside(root: string, absolute: string): string | null {
  const relative = path.relative(path.resolve(root), absolute);
  if (!relative || path.isAbsolute(relative)) return null;
  if (relative.split(/[\\/]/).some((part) => part === ".." || part === "")) return null;
  return relative;
}

function helpMtime(root: string, relative: string): number | null {
  try {
    if (isProjectHelpRoot(root)) {
      return statSync(path.join(process.cwd(), "content/help", relative)).mtimeMs;
    }
    return statSync(/*turbopackIgnore: true*/ path.resolve(root, relative)).mtimeMs;
  } catch {
    return null;
  }
}

function readHelpText(root: string, relative: string): string | null {
  try {
    if (isProjectHelpRoot(root)) {
      return readFileSync(path.join(process.cwd(), "content/help", relative), "utf8");
    }
    return readFileSync(/*turbopackIgnore: true*/ path.resolve(root, relative), "utf8");
  } catch {
    return null;
  }
}

export function readHelpMedia(root: string, articleId: string, file: string): Buffer | null {
  const absolute = resolveHelpMedia(root, articleId, file);
  if (!absolute) return null;
  const relative = relativeInside(root, absolute);
  if (!relative) return null;
  try {
    if (isProjectHelpRoot(root)) {
      return readFileSync(path.join(process.cwd(), "content/help", relative));
    }
    return readFileSync(/*turbopackIgnore: true*/ path.resolve(root, relative));
  } catch {
    return null;
  }
}

function readLocale(library: HelpLibrary, article: HelpArticlePolicy, locale: HelpLocale): HelpDocument | null {
  const absolute = resolveHelpFile(library.root, locale, article.file);
  if (!absolute) return null;
  const relative = relativeInside(library.root, absolute);
  if (!relative) return null;
  const mtimeMs = helpMtime(library.root, relative);
  if (mtimeMs === null) return null;
  const key = `${library.root}\n${locale}\n${article.id}\n${article.sourceRevision}`;
  const cached = cache.get(key);
  if (cached && cached.revision === article.sourceRevision && cached.mtimeMs === mtimeMs) {
    return cached.document;
  }
  const source = readHelpText(library.root, relative);
  if (source === null) return null;
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

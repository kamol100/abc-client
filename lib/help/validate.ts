import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { HelpArticlePolicy } from "../../content/help/catalog.ts";
import { isValidRoutePattern } from "./catalog.ts";
import { parseHelpFrontMatter } from "./front-matter.ts";

const ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const FILE = /^[a-z0-9]+(?:\/[a-z0-9-]+)*\.md$/;
const VIDEO = /^[A-Za-z0-9_-]{11}$/;
const LOCALES = ["en", "bn"] as const;
const UNSAFE = /<\s*[a-z!/]|<!--|javascript\s*:|data\s*:|vbscript\s*:|file\s*:|\]\(\s*\/\//i;
const HELP_LINK = /\]\(help:([a-z0-9]+(?:[.-][a-z0-9]+)*)\)/g;
const MEDIA_LINK = /\]\(media\/([a-z0-9][a-z0-9._-]{0,80}\.(?:png|jpe?g|webp|gif))\)/g;

function isPolicy(value: unknown): value is HelpArticlePolicy {
  if (!value || typeof value !== "object") return false;
  const article = value as HelpArticlePolicy;
  return typeof article.id === "string"
    && typeof article.slug === "string"
    && (article.kind === "guide" || article.kind === "faq")
    && (article.audience === "staff" || article.audience === "platform")
    && Array.isArray(article.requiredAll)
    && Array.isArray(article.requiredAny)
    && typeof article.baseline === "boolean"
    && Array.isArray(article.routePatterns)
    && Array.isArray(article.relatedIds)
    && typeof article.sortOrder === "number"
    && typeof article.sourceRevision === "string"
    && (article.publication === "published" || article.publication === "draft")
    && typeof article.file === "string";
}

function permissionNames(article: HelpArticlePolicy): string[] {
  return [...article.requiredAll, ...article.requiredAny].filter((name): name is string => typeof name === "string");
}

export function validateHelpTree(input: {
  articles: unknown;
  root: string;
  permissions: ReadonlySet<string>;
}): string[] {
  const errors: string[] = [];
  if (!Array.isArray(input.articles)) return ["catalog is not an array"];
  const articles: HelpArticlePolicy[] = [];
  input.articles.forEach((item, index) => {
    if (!isPolicy(item)) {
      errors.push(`article ${index} is not a policy`);
      return;
    }
    articles.push(item);
  });

  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const article of articles) {
    if (!ID.test(article.id)) errors.push(`${article.id} has an invalid id`);
    if (ids.has(article.id)) errors.push(`${article.id} is duplicated`);
    ids.add(article.id);
    if (slugs.has(article.slug)) errors.push(`${article.slug} slug is duplicated`);
    slugs.add(article.slug);
    if (article.slug !== article.file.replace(/\.md$/, "")) {
      errors.push(`${article.id} slug does not match its file`);
    }
    if (!FILE.test(article.file)) errors.push(`${article.id} has an unsafe file path`);
    if (article.baseline && article.feature) errors.push(`${article.id} baseline article cannot require a feature`);
    if (!article.baseline && (!article.feature || permissionNames(article).length === 0)) {
      errors.push(`${article.id} feature article needs a feature and a permission`);
    }
    if (article.audience === "platform" && !article.requiredAll.some((name) => name.startsWith("platform-support-admin."))) {
      errors.push(`${article.id} platform article needs a platform permission`);
    }
    if (article.audience === "staff" && permissionNames(article).some((name) => name.startsWith("platform-support-admin."))) {
      errors.push(`${article.id} staff article uses a platform permission`);
    }
    for (const name of permissionNames(article)) {
      if (!input.permissions.has(name)) errors.push(`${article.id} uses unknown permission ${name}`);
    }
    for (const pattern of article.routePatterns) {
      if (typeof pattern !== "string" || !isValidRoutePattern(pattern)) {
        errors.push(`${article.id} has an invalid route ${String(pattern)}`);
      }
    }
    if (article.publication === "published" && article.developmentEnglishFallback) {
      errors.push(`${article.id} published article cannot use an English fallback`);
    }
    const videos = article.videos ?? {};
    for (const locale of LOCALES) {
      const video = videos[locale];
      if (video !== undefined && !VIDEO.test(video)) errors.push(`${article.id} has an unsafe ${locale} video id`);
    }
  }

  const byId = new Map(articles.map((article) => [article.id, article]));
  for (const article of articles) {
    for (const relatedId of article.relatedIds) {
      const related = byId.get(relatedId);
      if (!related) {
        errors.push(`${article.id} related ${relatedId} is missing`);
        continue;
      }
      if (article.publication === "published" && related.publication !== "published") {
        errors.push(`${article.id} related ${relatedId} is unpublished`);
      }
    }
    for (const locale of LOCALES) {
      const file = path.resolve(input.root, locale, article.file);
      const root = path.resolve(input.root);
      const prefix = `${root}${path.sep}`;
      if (!file.startsWith(prefix)) {
        errors.push(`${article.id} ${locale} path escapes the help root`);
        continue;
      }
      if (!existsSync(file)) {
        if (locale === "bn" && article.publication === "draft" && article.developmentEnglishFallback) continue;
        errors.push(`${article.id} is missing ${locale}`);
        continue;
      }
      const parsed = parseHelpFrontMatter(readFileSync(file, "utf8"));
      if ("error" in parsed) {
        errors.push(`${article.id} ${locale} ${parsed.error}`);
        continue;
      }
      if (parsed.language !== locale) errors.push(`${article.id} ${locale} language does not match the folder`);
      if (parsed.translatedFromRevision !== article.sourceRevision) {
        errors.push(`${article.id} ${locale} revision is stale`);
      }
      if (UNSAFE.test(parsed.body)) errors.push(`${article.id} ${locale} contains unsafe markup or a URL`);
      for (const match of parsed.body.matchAll(HELP_LINK)) {
        const target = byId.get(match[1] ?? "");
        if (!target) errors.push(`${article.id} ${locale} links to missing ${match[1]}`);
        else if (article.publication === "published" && target.publication !== "published") {
          errors.push(`${article.id} ${locale} links to unpublished ${target.id}`);
        }
      }
      for (const match of parsed.body.matchAll(MEDIA_LINK)) {
        const media = path.resolve(input.root, "media", article.id, match[1] ?? "");
        if (!media.startsWith(`${path.resolve(input.root, "media")}${path.sep}`) || !existsSync(media)) {
          errors.push(`${article.id} ${locale} media ${match[1]} is missing or public`);
        }
        if (media.includes(`${path.sep}public${path.sep}`)) {
          errors.push(`${article.id} ${locale} media is in a public path`);
        }
      }
    }
  }
  return errors;
}

const COVERAGE_ROUTE = /^\/[a-z0-9*:][a-z0-9_*:/-]*$/;

export function validateHelpCoverage(input: {
  coverage: unknown;
  articles: readonly HelpArticlePolicy[];
  permissions: ReadonlySet<string>;
  raw: string;
}): string[] {
  const errors: string[] = [];
  if (/https?:\/\/|youtu\.be/i.test(input.raw)) errors.push("coverage contains a video URL");
  if (!input.coverage || typeof input.coverage !== "object") return ["coverage is not an object"];
  const coverage = input.coverage as {
    video_procedure?: unknown;
    inventory?: unknown;
    entries?: unknown;
    excluded?: unknown;
  };
  if (typeof coverage.video_procedure !== "string" || coverage.video_procedure.trim().length < 40) {
    errors.push("coverage is missing the video procedure");
  }
  if (!Array.isArray(coverage.entries) || !Array.isArray(coverage.excluded) || !Array.isArray(coverage.inventory)) {
    return [...errors, "coverage entries, excluded, or inventory is missing"];
  }
  const byId = new Map(input.articles.map((article) => [article.id, article]));
  const covered = new Set<string>();
  for (const entry of coverage.entries) {
    if (!entry || typeof entry !== "object") {
      errors.push("coverage entry is not an object");
      continue;
    }
    const row = entry as {
      route?: unknown;
      permission?: unknown;
      entitlement?: unknown;
      audience?: unknown;
      article_ids?: unknown;
      faq_ids?: unknown;
      revisions?: unknown;
      video_status?: unknown;
      review?: unknown;
    };
    if (typeof row.route !== "string" || !COVERAGE_ROUTE.test(row.route)) {
      errors.push(`coverage route is invalid: ${String(row.route)}`);
      continue;
    }
    covered.add(row.route);
    if (row.permission !== null && (typeof row.permission !== "string" || !input.permissions.has(row.permission))) {
      errors.push(`${row.route} permission is unknown`);
    }
    if (row.audience !== "staff" && row.audience !== "platform") errors.push(`${row.route} audience is invalid`);
    if (row.video_status !== "not_configured" && row.video_status !== "configured") {
      errors.push(`${row.route} video status is invalid`);
    }
    if (typeof row.review !== "string" || row.review.trim() === "") errors.push(`${row.route} review is missing`);
    const ids = Array.isArray(row.article_ids) ? row.article_ids : [];
    const faqs = Array.isArray(row.faq_ids) ? row.faq_ids : [];
    if (ids.length === 0) errors.push(`${row.route} has no articles`);
    for (const id of [...ids, ...faqs]) {
      if (typeof id !== "string") {
        errors.push(`${row.route} has a bad article id`);
        continue;
      }
      const article = byId.get(id);
      if (!article || article.publication !== "published") {
        errors.push(`${row.route} article ${id} is missing or unpublished`);
        continue;
      }
      if (row.audience === "platform" && article.audience !== "platform") {
        errors.push(`${row.route} lists a non-platform article ${id}`);
      }
      const revisions = row.revisions && typeof row.revisions === "object"
        ? (row.revisions as Record<string, { en?: string; bn?: string }>)[id]
        : undefined;
      if (!revisions || revisions.en !== article.sourceRevision || revisions.bn !== article.sourceRevision) {
        errors.push(`${row.route} revision for ${id} does not match ${article.sourceRevision}`);
      }
      if (row.video_status === "configured") {
        const videos = article.videos ?? {};
        if (!videos.en && !videos.bn) errors.push(`${row.route} is configured without a video id`);
      } else if (article.videos && (article.videos.en || article.videos.bn)) {
        errors.push(`${row.route} hides a configured video`);
      }
    }
    for (const id of faqs) {
      const article = typeof id === "string" ? byId.get(id) : undefined;
      if (article && article.kind !== "faq") errors.push(`${row.route} faq ${String(id)} is not a faq`);
    }
  }
  for (const item of coverage.excluded) {
    if (!item || typeof item !== "object") {
      errors.push("coverage exclusion is not an object");
      continue;
    }
    const row = item as { route?: unknown; reason?: unknown };
    if (typeof row.route !== "string" || typeof row.reason !== "string" || row.reason.trim().length < 12) {
      errors.push(`coverage exclusion is incomplete: ${String(row.route)}`);
      continue;
    }
    covered.add(row.route);
  }
  for (const route of coverage.inventory) {
    if (typeof route !== "string" || !covered.has(route)) errors.push(`inventory route is not covered: ${String(route)}`);
  }
  for (const article of input.articles) {
    if (article.publication !== "published") continue;
    for (const pattern of article.routePatterns) {
      if (!covered.has(pattern)) errors.push(`${article.id} route ${pattern} is missing from coverage`);
    }
  }
  return errors;
}

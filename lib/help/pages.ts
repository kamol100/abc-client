import "server-only";
import { helpTopicFor } from "@/lib/help/topics";
import { cache } from "react";
import { cookies } from "next/headers";
import type { HelpLocale } from "@/content/help/catalog";
import { canReadHelpArticle } from "@/lib/help/authorization";
import { loadHelpActor } from "@/lib/help/actor";
import { indexHelpArticles } from "@/lib/help/catalog";
import { loadHelpDocument, projectHelpLibrary } from "@/lib/help/content";
import { helpArticleView, type HelpArticleView, type HelpCard } from "@/lib/help/http";
import { helpVideoEmbed } from "@/lib/help/video";

const SLUG = /^[a-z0-9]+(?:\/[a-z0-9-]+)*$/;

export async function helpRequestLocale(): Promise<HelpLocale> {
  const jar = await cookies();
  return jar.get("lang")?.value === "bn" ? "bn" : "en";
}

export interface HelpIndexPage {
  locale: HelpLocale;
  cards: HelpCard[];
}

export const loadHelpIndex = cache(async (): Promise<HelpIndexPage | null> => {
  const actor = await loadHelpActor();
  if (actor.principal !== "staff") return null;
  const locale = await helpRequestLocale();
  const library = projectHelpLibrary();
  const cards = library.articles.flatMap((article) => {
    if (!canReadHelpArticle(actor, article, { allowDrafts: library.allowDrafts })) return [];
    const document = loadHelpDocument(library, article, locale);
    if (!document) return [];
    const alternate = document.locale === "bn" ? "en" : "bn";
    const video = helpVideoEmbed(article.videos?.[document.locale] ?? article.videos?.[alternate]);
    return [{
      id: article.id,
      topic: helpTopicFor(article),
      slug: article.slug,
      kind: article.kind,
      title: document.title,
      summary: document.summary,
      video_status: video ? "configured" as const : "not_configured" as const,
    }];
  });
  return { locale, cards };
});

export const loadHelpArticle = cache(async (slug: string): Promise<HelpArticleView | null> => {
  if (!SLUG.test(slug)) return null;
  const actor = await loadHelpActor();
  if (actor.principal !== "staff") return null;
  const locale = await helpRequestLocale();
  const library = projectHelpLibrary();
  const article = indexHelpArticles(library.articles).bySlug.get(slug);
  if (!article || !canReadHelpArticle(actor, article, { allowDrafts: library.allowDrafts })) return null;
  return helpArticleView(library, actor, article, locale);
});

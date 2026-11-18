import "server-only";
import { cache } from "react";
import { z } from "zod";
import { useFetch } from "@/app/actions";
import { loadHelpActor } from "@/lib/help/actor";
import type { HelpArticlePolicy, HelpLocale } from "@/content/help/catalog";
import { ANONYMOUS_HELP_ACTOR, type HelpActor } from "@/lib/help/authorization";
import { projectHelpLibrary, type HelpDocument, type HelpLibrary } from "@/lib/help/content";
import { helpPlainText } from "@/lib/help/render";

const documentsSchema = z.array(z.object({
  id: z.string(),
  slug: z.string(),
  kind: z.enum(["guide", "faq", "video"]),
  topic: z.string(),
  topic_label: z.string(),
  title: z.string(),
  summary: z.string(),
  body: z.string(),
  video: z.string().nullable(),
  keywords: z.array(z.string()),
  route_patterns: z.array(z.string()),
  related_ids: z.array(z.string()),
  sort_order: z.number(),
}));

export const loadDatabaseHelp = cache(async (locale: HelpLocale): Promise<{ actor: HelpActor; library: HelpLibrary }> => {
  const response = await useFetch({ url: `help-library?locale=${locale}` });
  const documents = new Map<string, HelpDocument>();
  const articles: HelpArticlePolicy[] = [];
  const library = { root: "content/help", allowDrafts: false, articles, documents };

  if (response?.status === 401 || response?.status === 403) return { actor: ANONYMOUS_HELP_ACTOR, library };
  // The existing reader remains available until the seed transaction has completed.
  if (response?.status === 503 && response.error?.code === "help_library_unseeded") {
    return { actor: await loadHelpActor(), library: projectHelpLibrary(false) };
  }
  const parsed = documentsSchema.safeParse(response?.data);
  if (!response?.success || !parsed.success) throw new Error("Help library is unavailable");

  for (const row of parsed.data) {
    // Laravel has already enforced each article's publication and access policy.
    const article: HelpArticlePolicy = {
      id: row.id, slug: row.slug, kind: row.kind, audience: "staff", publication: "published",
      category: { key: row.topic, label: row.topic_label },
      requiredAll: [], requiredAny: [], baseline: true,
      routePatterns: row.route_patterns, relatedIds: row.related_ids, sortOrder: row.sort_order,
      sourceRevision: "", file: "",
      videos: { en: row.video ?? undefined },
    };
    articles.push(article);
    documents.set(`${locale}:${row.id}`, {
      article, locale, requestedLocale: locale, fallback: false,
      title: row.title, summary: row.summary, body: row.body, keywords: row.keywords, text: helpPlainText(row.body),
    });
  }

  return { actor: { ...ANONYMOUS_HELP_ACTOR, principal: "staff" }, library };
});

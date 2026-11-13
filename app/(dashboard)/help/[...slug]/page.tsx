import { HelpReader } from "@/components/help/help-reader";
import { loadHelpArticle } from "@/lib/help/pages";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadHelpArticle(slug.join("/"));
  if (!article) {
    return {
      title: t("help.title"),
      description: t("help.description"),
    };
  }
  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const article = await loadHelpArticle(slug.join("/"));
  if (!article) notFound();
  return (
    <HelpReader
      articleId={article.id}
      title={article.title}
      summary={article.summary}
      html={article.html}
      headings={article.headings}
      related={article.related}
      video={article.video}
      featureHref={article.feature_href}
    />
  );
}

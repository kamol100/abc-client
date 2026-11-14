import { notFound } from "next/navigation";
import { useFetch } from "@/app/actions";
import { HelpReader } from "@/components/help/help-reader";
import { renderHelpMarkdown, renderHelpSummary } from "@/lib/help/render";
import { helpHeadings } from "@/lib/help/headings";
import { helpVideoEmbed } from "@/lib/help/video";
import { helpRequestLocale } from "@/lib/help/pages";
import { t } from "@/lib/i18n/server";
import { z } from "zod";

const previewSchema = z.object({
  id: z.string(), title: z.string(), summary: z.string(), body: z.string(),
  video: z.string().nullable(),
  slugs: z.record(z.string()),
});

export default async function HelpPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const locale = await helpRequestLocale();
  const result = await useFetch({ url: `platform-help-admin/articles/${id}?locale=${locale}` });
  const parsed = previewSchema.safeParse(result?.data?.preview);
  if (!result?.success || !parsed.success) notFound();
  const preview = parsed.data;
  const embed = helpVideoEmbed(preview.video);
  return <HelpReader articleId={preview.id} title={preview.title || t("help.management.preview")}
    summaryHtml={renderHelpSummary(preview.summary, preview.id, new Map(Object.entries(preview.slugs)))} html={renderHelpMarkdown(preview.body, preview.id, new Map(Object.entries(preview.slugs)))} headings={helpHeadings(preview.body)}
    related={[]} video={embed ? { ...embed, spoken_locale: "en" } : null} featureHref={null} />;
}

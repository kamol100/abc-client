"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { HelpArticleMarker } from "@/components/platform-support/support-widget";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

interface HelpHeadingView {
  id: string;
  level: 2 | 3;
  text: string;
}

interface HelpRelatedView {
  id: string;
  slug: string;
  title: string;
  summary: string;
}

interface HelpVideoView {
  spoken_locale: "en" | "bn";
  src: string;
}

export function safeHelpVideoSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.origin !== "https://www.youtube-nocookie.com") return null;
  if (url.pathname.includes("..")) return null;
  if (url.searchParams.has("autoplay") || url.searchParams.get("autoplay") === "1") return null;
  return url.toString();
}

export function HelpVideo({
  video,
  title,
}: {
  video: HelpVideoView | null;
  title: string;
}) {
  const { t } = useTranslation();
  const src = safeHelpVideoSrc(video?.src);
  const [failed, setFailed] = useState(false);
  if (!src || !video) return null;
  return (
    <figure className="space-y-2">
      <figcaption className="text-sm text-muted-foreground">
        {t(`help.video.spoken_${video.spoken_locale}`)}
      </figcaption>
      {!failed && (
        <iframe
          title={title}
          src={src}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setFailed(true)}
          className="aspect-video w-full rounded-md border border-border"
        />
      )}
      {failed && <p className="text-sm text-foreground">{t("help.video.unavailable")}</p>}
      <a href={src} className="text-sm text-foreground underline-offset-4 hover:underline" rel="noreferrer">
        {t("help.video.open")}
      </a>
    </figure>
  );
}

export function HelpReader({
  articleId,
  title,
  summary,
  html,
  headings,
  related,
  video,
  featureHref,
}: {
  articleId: string;
  title: string;
  summary: string;
  html: string;
  headings: HelpHeadingView[];
  related: HelpRelatedView[];
  video: HelpVideoView | null;
  featureHref: string | null;
}) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  return (
    <article className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <HelpArticleMarker articleId={articleId} />
      <aside className="flex flex-col gap-4">
        <nav aria-label={t("help.breadcrumb")} className="text-sm text-muted-foreground">
          <Link href="/help" className="text-foreground underline-offset-4 hover:underline">{t("help.title")}</Link>
        </nav>
        {headings.length > 0 && (
          <nav aria-label={t("help.on_this_page")} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-foreground">{t("help.on_this_page")}</h2>
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={cn(
                  "text-sm text-foreground underline-offset-4 hover:underline",
                  heading.level === 3 && "ps-3",
                )}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        )}
      </aside>
      <div className="flex min-w-0 flex-col gap-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
          </div>
          <div className="flex gap-2" role="group" aria-label={t("help.language")}>
            {(["en", "bn"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={language === item}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm",
                  language === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
                onClick={() => {
                  setLanguage(item);
                  router.refresh();
                }}
              >
                {t(item === "en" ? "help.language_en" : "help.language_bn")}
              </button>
            ))}
          </div>
        </header>
        <HelpVideo video={video} title={title} />
        <div
          className="space-y-3 text-sm text-foreground [&_a]:underline [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-medium [&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:list-disc [&_ul]:ps-5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {featureHref && (
          <p>
            <Link href={featureHref} className="text-sm text-foreground underline-offset-4 hover:underline">
              {t("help.back_to_feature")}
            </Link>
          </p>
        )}
        {related.length > 0 && (
          <section className="flex flex-col gap-2" aria-label={t("help.related")}>
            <h2 className="text-sm font-medium text-foreground">{t("help.related")}</h2>
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/help/${item.slug}`}
                className="text-sm text-foreground underline-offset-4 hover:underline"
              >
                {item.title}
              </Link>
            ))}
          </section>
        )}
      </div>
    </article>
  );
}

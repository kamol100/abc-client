"use client";

import { ArrowLeft, ArrowRight, BookOpen, List, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { HelpArticleMarker } from "@/components/platform-support/support-widget";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { HelpCardLink } from "@/components/help/help-centre";
import { SupportIcon, supportPageClass } from "@/components/platform-support/support-ui";
import { usePermissions } from "@/context/app-provider";

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
  const { hasPermission } = usePermissions();

  return (
    <div className={supportPageClass}>
      <HelpArticleMarker articleId={articleId} />
      <nav aria-label={t("help.breadcrumb")}>
        <MyButton url="/help" variant="ghost" className="-ms-2 text-muted-foreground">
          <ArrowLeft className="size-4" aria-hidden />{t("help.open_centre")}
        </MyButton>
      </nav>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,24%)]">
        <article className="min-w-0">
          <Card className="overflow-hidden shadow-none">
            <header className="space-y-3 border-b border-border bg-muted/25 p-5 sm:p-8">
              <SupportIcon icon={BookOpen} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 basis-56">
                  <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{summary}</p>
                </div>
                <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1" role="group" aria-label={t("help.language")}>
                  {(["en", "bn"] as const).map((item) => <MyButton key={item} type="button"
                    variant={language === item ? "secondary" : "ghost"} aria-pressed={language === item}
                    onClick={() => { setLanguage(item); router.refresh(); }}>
                    {t(item === "en" ? "help.language_en" : "help.language_bn")}
                  </MyButton>)}
                </div>
              </div>
            </header>
            <div className="space-y-5 p-5 sm:p-8">
              {headings.length > 0 && <details className="rounded-lg border border-border bg-muted/30 p-3 lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold">{t("help.on_this_page")}</summary>
                <ArticleContents headings={headings} />
              </details>}
              <HelpVideo key={video?.src} video={video} title={title} />
              <div
                className="max-w-prose space-y-4 break-words text-sm leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_code]:break-all [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h2]:scroll-mt-6 [&_h2]:mt-7 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:scroll-mt-6 [&_h3]:mt-5 [&_h3]:font-semibold [&_img]:max-w-full [&_img]:rounded-md [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:ps-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:list-disc [&_ul]:ps-5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <footer className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                {featureHref && <MyButton url={featureHref} variant="outline">{t("help.back_to_feature")}<ArrowRight aria-hidden className="size-4" /></MyButton>}
                {hasPermission("platform-support.create") && <MyButton url="/platform-support?kind=chat&compose=chat" variant="ghost">
                  <MessageCircle aria-hidden className="size-4" />{t("platform_support.actions.chat")}
                </MyButton>}
              </footer>
            </div>
          </Card>
        </article>
        <aside className="min-w-0 space-y-4">
          {headings.length > 0 && <Card className="hidden p-4 shadow-none lg:block">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><List className="size-4 text-muted-foreground" aria-hidden />{t("help.on_this_page")}</h2>
            <ArticleContents headings={headings} />
          </Card>}
          {related.length > 0 && <Card className="divide-y divide-border p-1 shadow-none">
            <h2 className="px-3 py-3 text-sm font-semibold">{t("help.related")}</h2>
            {related.map((item) => <HelpCardLink key={item.id} card={{ ...item, kind: "guide" }} />)}
          </Card>}
        </aside>
      </div>
    </div>
  );
}

function ArticleContents({ headings }: { headings: HelpHeadingView[] }) {
  const { t } = useTranslation();
  return <nav aria-label={t("help.on_this_page")} className="mt-2 flex flex-col gap-1">
    {headings.map((heading) => <a key={heading.id} href={`#${heading.id}`}
      className={cn("rounded-md px-2 py-1.5 text-sm leading-snug text-muted-foreground hover:bg-muted hover:text-foreground",
        heading.level === 3 && "ms-3 border-s border-border")}>{heading.text}</a>)}
  </nav>;
}

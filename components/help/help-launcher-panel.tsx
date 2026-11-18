"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, CircleHelp, FilePlus2, Headset, MessageCircle, PlayCircle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { HelpCardLink } from "@/components/help/help-centre";
import { IncludePageControl } from "@/components/platform-support/support-widget";
import MyButton from "@/components/my-button";
import { SupportIcon, SupportTabs } from "@/components/platform-support/support-ui";
import { usePermissions } from "@/context/app-provider";

interface HelpLauncherCard {
  id: string;
  slug: string;
  kind: "guide" | "faq";
  title: string;
  summary: string;
  video_status?: "configured" | "not_configured";
}

interface HelpContextPayload {
  matched?: boolean;
  page?: HelpLauncherCard[];
  related?: HelpLauncherCard[];
  general?: HelpLauncherCard[];
}

type LauncherTab = "page" | "guides" | "faqs" | "videos";

function isCard(value: unknown): value is HelpLauncherCard {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<HelpLauncherCard>;
  return typeof card.id === "string"
    && typeof card.slug === "string"
    && /^[a-z0-9]+(?:\/[a-z0-9-]+)*$/.test(card.slug)
    && (card.kind === "guide" || card.kind === "faq")
    && typeof card.title === "string"
    && typeof card.summary === "string";
}

export function HelpLauncherPanel({ onNavigate }: { onNavigate: () => void }) {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [tab, setTab] = useState<LauncherTab>("page");
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<HelpContextPayload | null>(null);
  const [results, setResults] = useState<HelpLauncherCard[] | null>(null);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const searchRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    searchRequest.current?.abort();
    setContext(null);
    setResults(null);
    setPending(true);
    setError(false);
    const load = async () => {
      try {
        const response = await fetch(`/api/help/context?route=${encodeURIComponent(pathname)}`, {
          credentials: "same-origin", cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw new Error("help_context_failed");
        const body = await response.json() as { data?: HelpContextPayload };
        if (!controller.signal.aborted) setContext(body.data ?? {});
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setPending(false);
      }
    };
    void load();
    return () => { controller.abort(); searchRequest.current?.abort(); };
  }, [attempt, i18n.language, pathname]);

  const page = (context?.page ?? []).filter(isCard);
  const related = (context?.related ?? []).filter(isCard);
  const general = (context?.general ?? []).filter(isCard);
  const pool = context?.matched ? [...page, ...related] : general;
  const unique = [...new Map(pool.map((card) => [card.id, card])).values()];
  const visible = results ?? unique.filter((card) => {
    if (tab === "page") return context?.matched ? page.some((item) => item.id === card.id) : true;
    if (tab === "faqs") return card.kind === "faq";
    if (tab === "videos") return card.video_status === "configured";
    return card.kind === "guide";
  });

  const search = async () => {
    searchRequest.current?.abort();
    const needle = query.trim();
    if (!needle) { setResults(null); setError(false); setPending(false); return; }
    const controller = new AbortController();
    searchRequest.current = controller;
    setError(false);
    setPending(true);
    try {
      const response = await fetch(
        `/api/help/search?q=${encodeURIComponent(needle)}&route=${encodeURIComponent(pathname)}`,
        { credentials: "same-origin", cache: "no-store", signal: controller.signal },
      );
      if (!response.ok) throw new Error("help_search_failed");
      const body = await response.json() as { data?: { results?: unknown[] } };
      if (!controller.signal.aborted) setResults((body.data?.results ?? []).filter(isCard));
    } catch {
      if (!controller.signal.aborted) { setResults([]); setError(true); }
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  };

  return (
    <div className="space-y-4 pt-2" data-testid="help-launcher-panel">
      <Card className="space-y-3 bg-muted/35 p-4 shadow-none">
        <div className="flex items-start gap-3">
          <SupportIcon icon={Headset} />
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{t("help.redesign.hero_title")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("help.redesign.hero_body")}</p>
          </div>
        </div>
        <form className="flex items-center gap-2 rounded-md border border-input bg-background p-1.5 focus-within:ring-2 focus-within:ring-ring"
          onSubmit={(event) => { event.preventDefault(); void search(); }}>
          <Search className="ms-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <label className="sr-only" htmlFor="help-launcher-search">{t("help.search_label")}</label>
          <input id="help-launcher-search" value={query} maxLength={80} onChange={(event) => setQuery(event.target.value)}
            placeholder={t("help.search_placeholder")} className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none" />
          <MyButton type="submit" variant="outline">{t("help.search_submit")}</MyButton>
        </form>
      </Card>

      <SupportTabs label={t("help.tabs.label")} value={tab} onChange={(item) => {
        searchRequest.current?.abort();
        if (searchRequest.current) setPending(false);
        searchRequest.current = null;
        setTab(item); setResults(null); setQuery(""); setError(false);
      }} items={[
        { value: "page", label: t("help.tabs.page") },
        { value: "guides", label: t("help.tabs.guides"), icon: BookOpen },
        { value: "faqs", label: t("help.tabs.faqs"), icon: CircleHelp },
        { value: "videos", label: t("help.tabs.videos"), icon: PlayCircle },
      ]} />

      <section aria-busy={pending} className="space-y-2">
        <h2 className="text-sm font-semibold">{results !== null ? t("help.redesign.results") : t(`help.tabs.${tab}`)}</h2>
        {pending ? <p role="status" className="py-2 text-sm text-muted-foreground">{t("help.loading")}</p>
          : error ? <div role="alert" className="space-y-2 text-sm"><p>{t("help.error")}</p>
            <MyButton type="button" variant="outline" onClick={() => query.trim() ? void search() : setAttempt((n) => n + 1)}>{t("help.retry")}</MyButton>
          </div>
          : <>
            {!context?.matched && results === null && tab === "page" && <p className="text-xs text-muted-foreground">{t("help.empty_page")}</p>}
            {visible.length > 0
              ? <Card className="divide-y divide-border p-1 shadow-none">{visible.map((card) => <HelpCardLink key={card.id} card={card} onNavigate={onNavigate} />)}</Card>
              : <p className="py-2 text-sm text-muted-foreground">{tab === "videos" && results === null ? t("help.empty_videos") : t("help.empty_search")}</p>}
          </>}
        <MyButton url="/help" variant="outline" data-testid="help-centre-link" onClick={onNavigate}>
          <BookOpen className="size-4" aria-hidden />{t("help.open_centre")}<ArrowRight className="size-4" aria-hidden />
        </MyButton>
      </section>

    </div>
  );
}

export function HelpLauncherActions({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("platform-support.create");
  return (
    <section className="space-y-2 border-t border-border pt-3" aria-label={t("help.redesign.contact_title")}>
      <div className="flex flex-wrap items-center gap-2">
        {canCreate && <>
          <MyButton url="/platform-support?kind=chat&compose=chat" variant="default" data-testid="platform-support-chat" onClick={onNavigate}>
            <MessageCircle className="size-4" aria-hidden />{t("platform_support.actions.chat")}
          </MyButton>
          <MyButton url="/platform-support?kind=issue&compose=issue" variant="outline" data-testid="platform-support-report" onClick={onNavigate}>
            <FilePlus2 className="size-4" aria-hidden />{t("platform_support.actions.report_issue")}
          </MyButton>
        </>}
        <MyButton url="/platform-support" variant="ghost" data-testid="platform-support-requests" onClick={onNavigate}>
          {t("platform_support.actions.my_requests")}<ArrowRight className="size-4" aria-hidden />
        </MyButton>
      </div>
      {canCreate && <IncludePageControl />}
    </section>
  );
}

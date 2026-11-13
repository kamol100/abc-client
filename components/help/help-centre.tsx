"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, ChevronDown, CircleHelp, FileText, Headset, Layers, MessageCircle, Network, PlayCircle, Search, Settings2, ShieldCheck, Users, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { SupportHeading, SupportIcon, SupportTabs, supportPageClass } from "@/components/platform-support/support-ui";
import { usePermissions } from "@/context/app-provider";
import type { HelpTopic } from "@/types/help-topic";

export interface HelpCardView {
  id: string;
  slug: string;
  topic: HelpTopic;
  kind: "guide" | "faq";
  title: string;
  summary: string;
  video_status?: "configured" | "not_configured";
}

type HelpTab = "guides" | "faqs" | "videos";
const topics = {
  getting_started: BookOpen, clients: Users, billing: Wallet, network: Network,
  resellers: Users, operations: Layers, settings: Settings2, platform: ShieldCheck,
} satisfies Record<HelpTopic, typeof BookOpen>;
const featured = ["support.getting-started", "clients.create", "invoices.overview", "support.contact"];

export function HelpCardLink({ card, onNavigate }: { card: Pick<HelpCardView, "slug" | "title" | "summary" | "kind">; onNavigate?: () => void }) {
  const Icon = card.kind === "faq" ? CircleHelp : FileText;
  return (
    <Link href={`/help/${card.slug}`} onClick={onNavigate}
      className="group flex min-w-0 items-start gap-3 rounded-md px-3 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block break-words text-sm font-medium text-foreground">{card.title}</span>
        <span className="mt-0.5 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">{card.summary}</span>
      </span>
      <ArrowRight aria-hidden className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function HelpCentre({ cards, locale }: { cards: HelpCardView[]; locale: "en" | "bn" }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const canContact = hasPermission("platform-support.create");
  const [tab, setTab] = useState<HelpTab>("guides");
  const [topic, setTopic] = useState<HelpTopic | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HelpCardView[] | null>(null);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const request = useRef<AbortController | null>(null);
  const browseRef = useRef<HTMLElement>(null);
  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    if (i18n.language !== locale && (i18n.language === "en" || i18n.language === "bn")) {
      request.current?.abort();
      setResults(null);
      setPending(false);
      setError(false);
      router.refresh();
    }
  }, [i18n.language, locale, router]);

  const clearSearch = () => {
    request.current?.abort();
    setQuery("");
    setResults(null);
    setError(false);
    setPending(false);
  };

  const search = async () => {
    const needle = query.trim();
    if (!needle) { clearSearch(); return; }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError(false);
    setResults(null);
    try {
      const response = await fetch(`/api/help/search?q=${encodeURIComponent(needle)}`, {
        credentials: "same-origin", cache: "no-store", signal: controller.signal,
      });
      if (!response.ok) throw new Error("help_search_failed");
      const body = await response.json() as { data?: { results?: HelpCardView[] } };
      if (!controller.signal.aborted) setResults(body.data?.results ?? []);
    } catch {
      if (!controller.signal.aborted) { setResults([]); setError(true); }
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  };

  const guides = cards.filter((card) => card.kind === "guide");
  const grouped = Object.entries(topics).flatMap(([id, Icon]) => {
    const group = guides.filter((card) => card.topic === id);
    return group.length ? [{ id: id as HelpTopic, Icon, count: group.length }] : [];
  });
  const visible = results ?? cards.filter((card) => {
    if (tab === "faqs") return card.kind === "faq";
    if (tab === "videos") return card.video_status === "configured";
    return card.kind === "guide" && (!topic || card.topic === topic);
  });
  const popular = featured.flatMap((id) => guides.find((card) => card.id === id) ?? []).slice(0, 3);
  const browse = results === null && !pending && tab === "guides" && !topic;

  return (
    <div className={supportPageClass}>
      <SupportHeading title={t("help.title")} subtitle={t("help.redesign.subtitle")} icon={BookOpen}
        action={canContact && <MyButton url="/platform-support?kind=issue&compose=issue" variant="default" action="create" title="platform_support.actions.report_issue" />} />

      <Card className="grid overflow-hidden bg-card shadow-none lg:grid-cols-[minmax(0,1fr)_minmax(13rem,36%)]">
        <div className="min-w-0 space-y-3 p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("help.redesign.eyebrow")}</p>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">{t("help.redesign.hero_title")}</h2>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{t("help.redesign.hero_body")}</p>
          <form className="flex max-w-lg items-center gap-2 rounded-lg border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring"
            onSubmit={(event) => { event.preventDefault(); void search(); }}>
            <Search className="ms-1.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <label className="sr-only" htmlFor="help-search">{t("help.search_label")}</label>
            <input id="help-search" value={query} maxLength={80} onChange={(event) => setQuery(event.target.value)}
              placeholder={t("help.search_placeholder")} className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none" />
            <MyButton type="submit" variant="default" loading={pending}>{t("help.search_submit")}</MyButton>
          </form>
        </div>
        <div aria-hidden className="relative hidden items-center justify-center overflow-hidden border-s border-border bg-muted/40 p-8 lg:flex">
          <div className="absolute size-56 rounded-full border border-primary/10" />
          <div className="absolute size-44 rounded-full border border-primary/10" />
          <div className="relative flex w-48 -rotate-3 flex-col gap-2 rounded-xl border border-border bg-card p-3.5 shadow-sm">
            {[BookOpen, MessageCircle, ShieldCheck].map((Icon, index) => <div key={index} className="flex items-center gap-2.5 rounded-md p-1">
              <SupportIcon icon={Icon} className="size-7" />
              <span className="flex flex-1 flex-col gap-1.5"><span className="h-1.5 w-4/5 rounded-full bg-muted" /><span className="h-1 w-1/2 rounded-full bg-muted" /></span>
            </div>)}
          </div>
        </div>
      </Card>

      <SupportTabs label={t("help.tabs.label")} value={tab} onChange={(value) => { clearSearch(); setTopic(null); setTab(value); }} items={[
        { value: "guides", label: t("help.tabs.guides"), icon: BookOpen },
        { value: "faqs", label: t("help.tabs.faqs"), icon: CircleHelp },
        { value: "videos", label: t("help.tabs.videos"), icon: PlayCircle },
      ]} />

      <section ref={browseRef} tabIndex={-1} aria-busy={pending} className="space-y-3 outline-none">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{results !== null || pending ? t("help.redesign.results") : topic
            ? t(`help.redesign.topics.${topic}`) : browse ? t("help.redesign.browse") : t(`help.tabs.${tab}`)}</h2>
          {(topic || results !== null || pending) && <MyButton type="button" variant="ghost" onClick={() => { clearSearch(); setTopic(null); }}>
            {t("help.redesign.clear")}
          </MyButton>}
          {browse && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck aria-hidden className="size-3.5" />{t("help.redesign.available")}</span>}
        </div>
        {pending ? <Card role="status" className="p-5 text-sm text-muted-foreground shadow-none">{t("help.loading")}</Card>
          : error ? <Card role="alert" className="flex items-center justify-between gap-3 p-4 text-sm shadow-none">
            {t("help.error")}<MyButton type="button" variant="outline" onClick={() => void search()}>{t("help.retry")}</MyButton>
          </Card>
          : browse && grouped.length > 0 ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {grouped.map(({ id, Icon, count }) => <MyButton key={id} type="button" unstyled
              className="group h-auto w-full justify-start whitespace-normal rounded-lg border border-border bg-card p-4 text-start shadow-none hover:border-primary/40 hover:bg-muted/40"
              onClick={() => { setTopic(id); browseRef.current?.focus(); }}>
              <SupportIcon icon={Icon} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{t(`help.redesign.topics.${id}`)}</span>
                <span className="mt-1 block text-xs font-normal text-muted-foreground">{t("help.redesign.guide_count", { count })}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </MyButton>)}
          </div>
          : visible.length === 0 ? <Card className="flex flex-col items-center gap-3 p-8 text-center shadow-none">
            <SupportIcon icon={tab === "videos" && results === null ? PlayCircle : Search} />
            <p className="text-sm text-muted-foreground">{tab === "videos" && results === null ? t("help.empty_videos") : t("help.empty_search")}</p>
          </Card>
          : <Card className="divide-y divide-border p-1 shadow-none">
            {visible.map((card) => tab === "faqs" && results === null
              ? <details key={card.id} className="group p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                  {card.title}<ChevronDown className="size-4 shrink-0 text-muted-foreground group-open:rotate-180" aria-hidden />
                </summary>
                <p className="my-3 text-sm text-muted-foreground">{card.summary}</p>
                <MyButton url={`/help/${card.slug}`} variant="outline">{t("help.redesign.read_guide")}<ArrowRight aria-hidden className="size-4" /></MyButton>
              </details>
              : <HelpCardLink key={card.id} card={card} />)}
          </Card>}
      </section>

      {browse && (popular.length > 0 || canContact) && <div className="grid gap-4 lg:grid-cols-2">
        {popular.length > 0 && <Card className="divide-y divide-border p-1 shadow-none">
          <h2 className="px-3 py-3 text-sm font-semibold">{t("help.redesign.featured")}</h2>
          {popular.map((card) => <HelpCardLink key={card.id} card={card} />)}
        </Card>}
        {canContact && <Card className="flex flex-col items-start gap-3 bg-muted/30 p-5 shadow-none">
          <SupportIcon icon={Headset} />
          <h2 className="text-base font-semibold">{t("help.redesign.contact_title")}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{t("help.redesign.contact_body")}</p>
          <div className="mt-auto flex flex-wrap gap-2">
            <MyButton url="/platform-support?kind=chat&compose=chat" variant="default"><MessageCircle className="size-4" aria-hidden />{t("platform_support.actions.chat")}</MyButton>
            <MyButton url="/platform-support?kind=issue&compose=issue" variant="outline">{t("platform_support.actions.report_issue")}</MyButton>
          </div>
        </Card>}
      </div>}
    </div>
  );
}

export function HelpGuideLink({ href, permission }: { href: string; permission: string }) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  if (!hasPermission(permission)) return null;
  return (
    <p className="mb-3">
      <Link href={href} className="text-sm text-foreground underline-offset-4 hover:underline">
        {t("help.guide_link")}
      </Link>
    </p>
  );
}

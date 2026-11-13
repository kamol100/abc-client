"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IncludePageControl } from "@/components/platform-support/support-widget";
import MyButton from "@/components/my-button";
import { cn } from "@/lib/utils";

interface HelpLauncherCard {
  id: string;
  slug: string;
  kind: "guide" | "faq";
  title: string;
  summary: string;
  video_status: "configured" | "not_configured";
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
  const card = value as HelpLauncherCard;
  return typeof card.id === "string"
    && typeof card.slug === "string"
    && (card.kind === "guide" || card.kind === "faq")
    && typeof card.title === "string"
    && card.slug.startsWith("/") === false
    && !card.slug.includes("..");
}

export function HelpLauncherPanel({
  support,
  onNavigate,
}: {
  support: boolean;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [tab, setTab] = useState<LauncherTab>("page");
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<HelpContextPayload | null>(null);
  const [results, setResults] = useState<HelpLauncherCard[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError(false);
      try {
        const response = await fetch(`/api/help/context?route=${encodeURIComponent(pathname)}`, {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) {
          if (!cancelled) setError(true);
          return;
        }
        const body = await response.json() as { data?: HelpContextPayload };
        if (!cancelled) setContext(body.data ?? null);
      } catch {
        if (!cancelled) setError(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const page = (context?.page ?? []).filter(isCard);
  const related = (context?.related ?? []).filter(isCard);
  const general = (context?.general ?? []).filter(isCard);
  const pool = context?.matched ? [...page, ...related] : general;
  const visible = (results ?? pool).filter((card) => {
    if (results) return true;
    if (tab === "page") return context?.matched ? page.some((item) => item.id === card.id) : true;
    if (tab === "faqs") return card.kind === "faq";
    if (tab === "videos") return card.video_status === "configured";
    return card.kind === "guide";
  });

  const search = async () => {
    const needle = query.trim();
    if (!needle) {
      setResults(null);
      return;
    }
    setError(false);
    try {
      const response = await fetch(
        `/api/help/search?q=${encodeURIComponent(needle)}&route=${encodeURIComponent(pathname)}`,
        { credentials: "same-origin", cache: "no-store" },
      );
      if (!response.ok) {
        setResults([]);
        setError(true);
        return;
      }
      const body = await response.json() as { data?: { results?: unknown[] } };
      setResults((body.data?.results ?? []).filter(isCard));
    } catch {
      setResults([]);
      setError(true);
    }
  };

  const links = support
    ? [
      { href: "/platform-support?kind=issue&compose=issue", label: "platform_support.actions.report_issue", testId: "platform-support-report" },
      { href: "/platform-support?kind=chat&compose=chat", label: "platform_support.actions.chat", testId: "platform-support-chat" },
      { href: "/platform-support", label: "platform_support.actions.my_requests", testId: "platform-support-requests" },
    ]
    : [];

  return (
    <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto" data-testid="help-launcher-panel">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <label className="sr-only" htmlFor="help-launcher-search">{t("help.search_label")}</label>
        <input
          id="help-launcher-search"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("help.search_placeholder")}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <MyButton type="submit" variant="outline">{t("help.search_submit")}</MyButton>
      </form>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("help.tabs.label")}>
        {(["page", "guides", "faqs", "videos"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={cn(
              "rounded-md px-2 py-1 text-sm",
              tab === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
            )}
            onClick={() => {
              setTab(item);
              setResults(null);
              setQuery("");
            }}
          >
            {t(`help.tabs.${item}`)}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-foreground">{t("help.error")}</p>}
      {!context?.matched && results === null && tab === "page" && (
        <p className="text-sm text-muted-foreground">{t("help.empty_page")}</p>
      )}
      {visible.length === 0 && tab === "videos" && results === null && (
        <p className="text-sm text-muted-foreground">{t("help.empty_videos")}</p>
      )}
      <div className="flex flex-col gap-2">
        {visible.map((card) => (
          <Link
            key={card.id}
            href={`/help/${card.slug}`}
            onClick={onNavigate}
            className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
          >
            {card.title}
          </Link>
        ))}
      </div>
      <Link
        href="/help"
        data-testid="help-centre-link"
        onClick={onNavigate}
        className="text-sm text-foreground underline-offset-4 hover:underline"
      >
        {t("help.open_centre")}
      </Link>
      <IncludePageControl />
      {links.map((link) => (
        <Link
          key={link.testId}
          href={link.href}
          data-testid={link.testId}
          onClick={onNavigate}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
        >
          {t(link.label)}
        </Link>
      ))}
    </div>
  );
}

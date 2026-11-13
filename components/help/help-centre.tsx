"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { usePermissions } from "@/context/app-provider";
import { cn } from "@/lib/utils";

export interface HelpCardView {
  id: string;
  slug: string;
  kind: "guide" | "faq";
  title: string;
  summary: string;
  video_status: "configured" | "not_configured";
}

type HelpTab = "guides" | "faqs" | "videos";

function HelpCardLink({ card }: { card: HelpCardView }) {
  return (
    <Link
      href={`/help/${card.slug}`}
      className="block rounded-md border border-border bg-background px-3 py-2 text-foreground hover:bg-muted"
    >
      <span className="block text-sm font-medium">{card.title}</span>
      <span className="mt-1 block text-sm text-muted-foreground">{card.summary}</span>
    </Link>
  );
}

export function HelpCentre({ cards }: { cards: HelpCardView[] }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<HelpTab>("guides");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HelpCardView[] | null>(null);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  const search = async () => {
    const needle = query.trim();
    if (!needle) {
      setResults(null);
      setError(false);
      return;
    }
    setPending(true);
    setError(false);
    try {
      const response = await fetch(`/api/help/search?q=${encodeURIComponent(needle)}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        setResults([]);
        setError(true);
        return;
      }
      const body = await response.json() as { data?: { results?: HelpCardView[] } };
      setResults(body.data?.results ?? []);
    } catch {
      setResults([]);
      setError(true);
    } finally {
      setPending(false);
    }
  };

  const visible = results ?? cards.filter((card) => {
    if (tab === "faqs") return card.kind === "faq";
    if (tab === "videos") return card.video_status === "configured";
    return card.kind === "guide";
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">{t("help.title")}</h1>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <label className="sr-only" htmlFor="help-search">{t("help.search_label")}</label>
        <input
          id="help-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("help.search_placeholder")}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <MyButton type="submit" variant="default">{t("help.search_submit")}</MyButton>
      </form>
      {results === null && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("help.tabs.label")}>
          {(["guides", "faqs", "videos"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                tab === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}
              onClick={() => setTab(item)}
            >
              {t(`help.tabs.${item}`)}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-foreground">
          {t("help.error")}
          <MyButton type="button" variant="outline" className="ms-2" onClick={() => void search()}>
            {t("help.retry")}
          </MyButton>
        </p>
      )}
      {pending && <p className="text-sm text-muted-foreground">{t("help.loading")}</p>}
      {!pending && visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {tab === "videos" && results === null ? t("help.empty_videos") : t("help.empty_search")}
        </p>
      )}
      <div className="grid gap-2">
        {visible.map((card) => <HelpCardLink key={card.id} card={card} />)}
      </div>
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

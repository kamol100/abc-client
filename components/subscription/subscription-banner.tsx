"use client";

import MyButton from "@/components/my-button";
import { useProfile, useSubscription } from "@/context/app-provider";
import { formatMoney } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import type { SubscriptionSummary } from "@/types/app";
import { useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const DISMISS_STORAGE_KEY = "subscription-banner-dismissed";

type AlertKind = "grace" | "expired";

interface BannerCopy {
  kind: AlertKind;
  key: string;
  values: Record<string, string | number>;
}

function calendarDay(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function dismissalKey(companyId: string, kind: AlertKind): string {
  return `${companyId}:${kind}`;
}

function isDismissalRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Object.values(value).every((entry) => typeof entry === "string");
}

function readDismissals(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return isDismissalRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isDismissed(companyId: string, kind: AlertKind, day: string): boolean {
  return readDismissals()[dismissalKey(companyId, kind)] === day;
}

function writeDismissal(companyId: string, kind: AlertKind, day: string): void {
  if (typeof window === "undefined") return;
  const next = readDismissals();
  next[dismissalKey(companyId, kind)] = day;
  window.localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(next));
}

function bannerCopy(subscription: SubscriptionSummary): BannerCopy | null {
  const amount = formatMoney(Math.max(0, subscription.due_amount ?? 0));

  if (subscription.state === "expired") {
    return {
      kind: "expired",
      key: "subscription.banner.expired",
      values: { amount },
    };
  }

  if (subscription.state !== "grace") return null;

  const days = Math.max(0, Math.trunc(subscription.days_remaining ?? 0));
  const key =
    days === 0
      ? "subscription.banner.grace_today"
      : days === 1
        ? "subscription.banner.grace_one"
        : "subscription.banner.grace";

  return {
    kind: "grace",
    key,
    values: { plan: subscription.plan_name, days, amount },
  };
}

function SubscriptionMarquee({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const update = () => {
      setOverflows(measure.scrollWidth > container.clientWidth);
    };

    update();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [text]);

  const shouldScroll = overflows && prefersReducedMotion === false;

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1 overflow-hidden">
      <span ref={measureRef} className="invisible absolute whitespace-nowrap" aria-hidden>
        {text}
      </span>
      {shouldScroll ? (
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          <span className="whitespace-nowrap pr-16">{text}</span>
          <span className="whitespace-nowrap pr-16" aria-hidden>
            {text}
          </span>
        </div>
      ) : (
        <span className="block truncate whitespace-nowrap" title={overflows ? text : undefined}>
          {text}
        </span>
      )}
    </div>
  );
}

export default function SubscriptionBanner() {
  const { subscription } = useSubscription();
  const { profile } = useProfile();
  const { t } = useTranslation();
  const copy = subscription ? bannerCopy(subscription) : null;
  const kind = copy?.kind ?? null;
  const companyId = profile.company?.uuid || "unknown";
  const day = subscription?.today || calendarDay("UTC");
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!kind) {
      setHidden(false);
      setReady(true);
      return;
    }

    setHidden(isDismissed(companyId, kind, day));
    setReady(true);
  }, [companyId, kind, day]);

  if (!copy || !ready || hidden) return null;

  const expired = copy.kind === "expired";
  const message = t(copy.key, copy.values);
  const actionClass = expired
    ? "text-destructive-foreground hover:bg-destructive-foreground/15 hover:text-destructive-foreground"
    : "text-warning-foreground hover:bg-warning-foreground/15 hover:text-warning-foreground";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
        expired
          ? "border-destructive/40 bg-destructive text-destructive-foreground"
          : "border-warning-foreground/20 bg-warning text-warning-foreground",
      )}
    >
      <SubscriptionMarquee text={message} />
      <div className="flex shrink-0 items-center">
        <MyButton
          url="/subscription"
          variant="ghost"
          size="icon"
          tooltip="subscription.banner.view"
          aria-label={t("subscription.banner.view")}
          className={cn("h-7 w-7", actionClass)}
        >
          <Eye aria-hidden />
        </MyButton>
        <MyButton
          action="cancel"
          type="button"
          variant="ghost"
          size="icon"
          tooltip="subscription.banner.close"
          aria-label={t("subscription.banner.close")}
          className={cn("h-7 w-7", actionClass)}
          onClick={() => {
            writeDismissal(companyId, copy.kind, day);
            setHidden(true);
          }}
        />
      </div>
    </div>
  );
}

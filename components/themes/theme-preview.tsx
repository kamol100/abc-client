"use client";

import { previewCss } from "@/lib/theme/theme-palette";
import { cn } from "@/lib/utils";
import type { ThemeRecordSettings } from "@/types/theme-types";
import { HandCoins, UserPlus, Users } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { displayPalette } from "@/components/themes/theme-presets";

const NAV_ITEMS = ["dashboard", "clients", "invoice", "funds", "communication"] as const;
const PAYMENT_SHARE = [38, 24, 20, 12, 6] as const;
const PAYMENT_METHODS = ["bKash", "Nagad", "Cash", "Bank", "Card"] as const;
const WEEK_HEIGHTS = ["h-[52%]", "h-[70%]", "h-[44%]", "h-[88%]", "h-[64%]", "h-[96%]", "h-[58%]"] as const;
const SHARE_WIDTHS = ["w-[38%]", "w-[24%]", "w-[20%]", "w-[12%]", "w-[6%]"] as const;
const CHART_BG = [
  "bg-[hsl(var(--chart-1))]",
  "bg-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-4))]",
  "bg-[hsl(var(--chart-5))]",
] as const;
/** Stat tiles drawn like the dashboard cards, so the card border and color options show here too. */
const PREVIEW_TILES = [
  { key: "active", value: "1,148", icon: Users, tone: "dashboard-tone-1" },
  { key: "collected_today", value: "৳9,650", icon: HandCoins, tone: "dashboard-tone-2" },
  { key: "new_month", value: "37", icon: UserPlus, tone: "dashboard-tone-3" },
] as const;
const SAMPLE_CLIENTS = [
  { name: "Rahim Uddin", id: "rahim01", plan: "20 Mbps", status: "active" },
  { name: "Nusrat Jahan", id: "nusrat_bd", plan: "40 Mbps", status: "due" },
  { name: "Karim Store", id: "karimstore", plan: "10 Mbps", status: "expired" },
] as const;
const STATUS_CLASS = {
  active: "theme-badge-success",
  due: "theme-badge-warning",
  expired: "theme-badge-danger",
} as const;

/**
 * A small Clients screen drawn with the theme's own CSS variables, scoped to this
 * element (see previewCss), so it shows a theme without changing the page.
 */
export function ThemePreview({
  settings,
  dark,
  variant = "full",
  className,
}: {
  settings: ThemeRecordSettings;
  dark: boolean;
  /** full: the Clients screen; card: sidebar and chart colors; sidebar: the sidebar gradient only. */
  variant?: "full" | "card" | "sidebar";
  className?: string;
}) {
  const { t } = useTranslation();
  const scopeId = `tp-${useId().replace(/[^a-z0-9]/gi, "")}`;
  const css = previewCss(scopeId, settings, displayPalette(settings));
  const gradients = settings.gradients === "on";
  const font = settings.font === "plex" ? "font-[family-name:var(--font-plex-sans)]" : "font-[family-name:var(--font-geist-sans)]";

  if (variant !== "full") {
    return (
      <div data-theme-preview={scopeId} className={cn("flex h-full w-full overflow-hidden", dark && "dark", className)} aria-hidden="true">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className={cn("theme-palette-sidebar bg-sidebar", variant === "sidebar" ? "w-full" : "w-[30%]")} />
        {variant === "card" && (
          <div className="flex flex-1 items-end gap-0.5 bg-background p-1">
            {CHART_BG.slice(0, 4).map((bg, index) => (
              <span key={bg} className={cn("block w-full rounded-[1px]", bg, WEEK_HEIGHTS[index])} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-theme-preview={scopeId}
      className={cn("overflow-hidden rounded-xl border text-foreground", dark && "dark", font, className)}
      aria-label={t("themes.preview.label")}
      role="img"
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="grid min-h-[26rem] grid-cols-[2.75rem_minmax(0,1fr)] bg-background text-xs sm:grid-cols-[9rem_minmax(0,1fr)]">
        <aside className="theme-palette-sidebar flex flex-col gap-1 bg-sidebar p-2 text-sidebar-foreground">
          <div className="flex items-center gap-2 px-1 pb-2 pt-1 font-semibold">
            <span className="size-4 shrink-0 rounded-[5px] bg-sidebar-foreground/90" />
            <span className="hidden truncate sm:inline">ISPTIK</span>
          </div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5",
                item === "clients"
                  ? cn("bg-sidebar-accent font-medium text-sidebar-active-foreground", gradients && "bg-[image:var(--gradient-sidebar)]")
                  : "opacity-80",
              )}
            >
              <span className="size-3 shrink-0 rounded-[3px] border-[1.5px] border-current" />
              <span className="hidden truncate sm:inline">{t(`themes.preview.nav.${item}`)}</span>
            </div>
          ))}
        </aside>

        <div className={cn("grid min-w-0 content-start gap-2.5 bg-background p-3", gradients && "bg-[image:var(--gradient-dashboard)]")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {t("themes.preview.clients")} <span className="font-normal text-muted-foreground">(1,284)</span>
            </p>
            <div className="flex gap-1.5">
              <span className="rounded-md border bg-card px-2.5 py-1 font-medium">{t("themes.preview.filter")}</span>
              <span
                className={cn(
                  "rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground shadow-[var(--shadow-card)]",
                  gradients && "bg-[image:var(--gradient-button)]",
                )}
              >
                {t("themes.preview.add_client")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">{t("themes.preview.collected")} ৳82,400</span>
            <span className="rounded-full bg-[hsl(var(--brand-secondary)/0.15)] px-2 py-0.5 font-medium text-[hsl(var(--brand-secondary))]">{t("themes.preview.due")} ৳12,350</span>
            <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">{t("themes.preview.online")} 1,036</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PREVIEW_TILES.map(({ key, value, icon: Icon, tone }, index) => (
              <div
                key={key}
                className={cn(
                  "dashboard-accent-card flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border bg-card p-2 shadow-[var(--shadow-card)]",
                  tone,
                  index === 2 && "hidden sm:flex",
                )}
              >
                <span className="dashboard-card-icon dashboard-card-icon-sm">
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.7rem] text-muted-foreground">{t(`themes.preview.tiles.${key}`)}</p>
                  <p className="text-base font-bold tabular-nums">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-2 rounded-xl border bg-card p-2.5 shadow-[var(--shadow-card)]">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("themes.preview.payments")}</p>
            <div className="flex h-2 overflow-hidden rounded-full">
              {CHART_BG.map((bg, index) => (
                <span key={bg} className={cn("block h-full", bg, SHARE_WIDTHS[index])} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] text-muted-foreground">
              {PAYMENT_METHODS.map((method, index) => (
                <span key={method} className="inline-flex items-center gap-1">
                  <span className={cn("size-2 rounded-sm", CHART_BG[index])} />
                  {method} {PAYMENT_SHARE[index]}%
                </span>
              ))}
            </div>
            <div className="grid h-12 grid-cols-7 items-end gap-1.5">
              {WEEK_HEIGHTS.map((height) => (
                <span
                  key={height}
                  className={cn("block rounded-t-[3px] bg-primary", gradients && "bg-[image:var(--gradient-button)]", height)}
                />
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border bg-card shadow-[var(--shadow-card)]">
            <table className="w-full text-left">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-1.5 font-medium">{t("themes.preview.name")}</th>
                  <th className="px-2 py-1.5 font-medium">PPPoE</th>
                  <th className="hidden px-2 py-1.5 font-medium sm:table-cell">{t("themes.preview.package")}</th>
                  <th className="px-2 py-1.5 font-medium">{t("themes.preview.status")}</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_CLIENTS.map((client) => (
                  <tr key={client.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap px-2 py-1.5">{client.name}</td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-muted-foreground">{client.id}</td>
                    <td className="hidden whitespace-nowrap px-2 py-1.5 sm:table-cell">{client.plan}</td>
                    <td className="px-2 py-1.5">
                      <span className={cn("rounded-full px-2 py-0.5 font-medium", STATUS_CLASS[client.status])}>
                        {t(`themes.preview.statuses.${client.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-dialog border bg-card px-3 py-2 shadow-[var(--shadow-card)]">
            <span className="text-muted-foreground">{t("themes.preview.dialog")}</span>
            <span className={cn("rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground", gradients && "bg-[image:var(--gradient-button)]")}>
              {t("common.save")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

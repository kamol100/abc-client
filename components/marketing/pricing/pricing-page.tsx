"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Check, Minus, ArrowRight, MessageSquare, Infinity as InfinityIcon, Wrench, Headphones } from "lucide-react";
import { useCompany } from "@/context/company-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLAN_ORDER = ["basic", "standard", "premium"] as const;
const TIER_COUNT = 8;
const TIER_INDEXES = Array.from({ length: TIER_COUNT }, (_, i) => i);

const MONTHLY_BDT: Record<(typeof PLAN_ORDER)[number], number[]> = {
  basic: [1_000, 1_500, 2_000, 3_000, 4_000, 6_000, 8_000, 10_000],
  standard: [1_500, 2_500, 3_250, 4_750, 6_250, 9_250, 12_250, 16_500],
  premium: [2_500, 3_500, 4_500, 6_500, 8_500, 12_500, 16_500, 20_000],
};

const HIGHLIGHT_PLAN: (typeof PLAN_ORDER)[number] = "standard";

type Cell = "y" | "n" | "a";
const TABLE_ROWS: { key: string; cell: [Cell, Cell, Cell] }[] = [
  { key: "multi_branch", cell: ["n", "y", "y"] },
  { key: "client", cell: ["y", "y", "y"] },
  { key: "billing", cell: ["y", "y", "y"] },
  { key: "hr", cell: ["n", "y", "y"] },
  { key: "ticketing", cell: ["y", "y", "y"] },
  { key: "mac_reseller_portal", cell: ["n", "y", "y"] },
  { key: "mac_reseller_app", cell: ["n", "n", "y"] },
  { key: "task", cell: ["y", "y", "y"] },
  { key: "product_purchase", cell: ["n", "y", "y"] },
  { key: "inventory", cell: ["n", "y", "y"] },
  { key: "network_diagram", cell: ["n", "y", "y"] },
  { key: "accounts", cell: ["n", "y", "y"] },
  { key: "asset", cell: ["n", "n", "y"] },
  { key: "bw_purchase", cell: ["n", "n", "y"] },
  { key: "bw_sale", cell: ["n", "n", "y"] },
  { key: "bw_reseller", cell: ["n", "n", "y"] },
  { key: "reports", cell: ["y", "y", "y"] },
  { key: "sms_mailing", cell: ["y", "y", "y"] },
  { key: "client_portal", cell: ["y", "y", "y"] },
  { key: "addon_admin", cell: ["a", "a", "a"] },
  { key: "addon_gateway", cell: ["a", "a", "a"] },
  { key: "addon_olt", cell: ["a", "a", "a"] },
];

function formatBdt(n: number): string {
  return `৳${n.toLocaleString("en-IN")}`;
}

function PricingHero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("pricing_page.hero.title")}
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {t("pricing_page.hero.subtitle")}
          </p>
        </div>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border bg-muted/20 shadow-sm">
          <Image
            src="/static/pricing/pricing-hero.png"
            alt={t("pricing_page.hero.image_alt")}
            width={800}
            height={450}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}

function PlanCell({ kind }: { kind: Cell }) {
  const { t } = useTranslation();
  if (kind === "y")
    return (
      <div className="flex justify-center">
        <Check className="size-4 text-primary" aria-label={t("pricing_page.cell.yes")} />
      </div>
    );
  if (kind === "n")
    return (
      <div className="flex justify-center text-muted-foreground/40">
        <Minus className="size-4" aria-label={t("pricing_page.cell.no")} />
      </div>
    );
  return (
    <span className="block text-center text-xs text-muted-foreground sm:text-sm">
      {t("pricing_page.cell.addon")}
    </span>
  );
}

export default function PricingPage() {
  const { t } = useTranslation();
  const { company } = useCompany();
  const [tierIndex, setTierIndex] = useState(0);
  const contactHref = company.email ? `mailto:${company.email}` : "/demo-request";

  return (
    <>
      <PricingHero />

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
          <p className="text-center text-sm font-medium text-muted-foreground">
            {t("pricing_page.tier_label")}
          </p>
          <Select
            value={String(tierIndex)}
            onValueChange={(v) => setTierIndex(Number.parseInt(v, 10))}
          >
            <SelectTrigger className="h-11 w-full bg-background text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIER_INDEXES.map((i) => (
                <SelectItem key={i} value={String(i)}>
                  {t(`pricing_page.tiers.${i}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-3">
          {PLAN_ORDER.map((plan) => {
            const highlighted = plan === HIGHLIGHT_PLAN;
            const monthly = MONTHLY_BDT[plan][tierIndex];

            return (
              <Card
                key={plan}
                className={cn(
                  "flex flex-col",
                  highlighted && "border-primary shadow-md"
                )}
              >
                <CardHeader>
                  {highlighted && (
                    <span className="mb-1 w-fit rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                      {t("pricing_page.popular")}
                    </span>
                  )}
                  <CardTitle className="text-xl">{t(`pricing_page.plans.${plan}.name`)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t(`pricing_page.plans.${plan}.description`)}
                  </p>
                </CardHeader>
                <CardContent className="mt-auto flex flex-1 flex-col gap-4">
                  <div>
                    <div className="text-3xl font-bold tracking-tight">
                      {t(`pricing_page.plans.${plan}.from_price`)}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("pricing_page.monthly_for_tier")}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatBdt(monthly)} {t("pricing_page.per_month_suffix")}
                    </p>
                  </div>
                  <Button asChild variant={highlighted ? "default" : "outline"} className="w-full">
                    <Link href="/demo-request">
                      {t("pricing_page.cta")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("pricing_page.compare_title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {t("pricing_page.compare_subtitle")}
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-background">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 font-medium sm:min-w-[12rem] sm:p-4">
                    {t("pricing_page.table.feature_column")}
                  </th>
                  {PLAN_ORDER.map((p) => (
                    <th key={p} className="p-3 text-center font-medium sm:w-32 sm:p-4">
                      {t(`pricing_page.plans.${p}.name`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.key} className="border-b last:border-0">
                    <td className="p-3 sm:p-4">
                      {t(`pricing_page.row_labels.${row.key}`)}
                    </td>
                    {row.cell.map((c, i) => (
                      <td key={i} className="p-3 sm:p-4">
                        <PlanCell kind={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 text-xs text-muted-foreground sm:text-sm">
            <li>{t("pricing_page.footnote_1")}</li>
            <li>{t("pricing_page.footnote_2")}</li>
            <li>{t("pricing_page.footnote_3")}</li>
          </ul>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("pricing_page.custom.title")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("pricing_page.custom.subtitle")}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { icon: Wrench, tkey: "c1" as const },
                { icon: InfinityIcon, tkey: "c2" as const },
                { icon: MessageSquare, tkey: "c3" as const },
                { icon: Headphones, tkey: "c4" as const },
              ] as const
            ).map(({ icon: Icon, tkey }) => (
              <div key={tkey} className="flex flex-col gap-2 rounded-xl border bg-background p-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold">
                  {t(`pricing_page.custom.${tkey}`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`pricing_page.custom.${tkey}_desc`)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg">
              <Link href="/demo-request">
                {t("pricing_page.custom.primary_cta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={contactHref}>
                {t("pricing_page.custom.secondary_cta")}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

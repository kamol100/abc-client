"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Check, Minus } from "lucide-react";
import { useCompany } from "@/context/company-provider";
import { cn } from "@/lib/utils";
import {
  HIGHLIGHT_PLAN,
  MONTHLY_BDT,
  PLAN_ORDER,
  TIER_COUNT,
  formatBdt,
} from "@/components/marketing/pricing/pricing-data";
import "@/components/marketing/pricing/pricing.css";

const TIER_INDEXES = Array.from({ length: TIER_COUNT }, (_, i) => i);

type Cell = "y" | "n" | "a";
type Row = { key: string; cell: [Cell, Cell, Cell] };

// Only modules with code behind them (feature inventory). Removed: multi_branch, task,
// network_diagram, bw_purchase, bw_sale, bw_reseller, mac_reseller_app, asset.
const FEATURE_ROWS: Row[] = [
  { key: "client", cell: ["y", "y", "y"] },
  { key: "billing", cell: ["y", "y", "y"] },
  { key: "hr", cell: ["n", "y", "y"] },
  { key: "ticketing", cell: ["y", "y", "y"] },
  { key: "mac_reseller_portal", cell: ["n", "y", "y"] },
  { key: "product_purchase", cell: ["n", "y", "y"] },
  { key: "inventory", cell: ["n", "y", "y"] },
  { key: "accounts", cell: ["n", "y", "y"] },
  { key: "reports", cell: ["y", "y", "y"] },
  { key: "sms_mailing", cell: ["y", "y", "y"] },
  { key: "client_portal", cell: ["y", "y", "y"] },
];

const ADDON_ROWS: Row[] = [
  { key: "addon_admin", cell: ["a", "a", "a"] },
  { key: "addon_gateway", cell: ["a", "a", "a"] },
  { key: "addon_olt", cell: ["a", "a", "a"] },
];

const CUSTOM_ITEMS = ["c1", "c2", "c3", "c4"] as const;

function PlanCell({ kind }: { kind: Cell }) {
  const { t } = useTranslation();
  if (kind === "a") return <span>{t("pricing_page.cell.addon")}</span>;
  const Icon = kind === "y" ? Check : Minus;
  return (
    <>
      <Icon className={cn("mkt-price-mark", kind === "n" && "mkt-price-mark--no")} strokeWidth={1.25} aria-hidden="true" />
      <span className="visually-hidden">{t(kind === "y" ? "pricing_page.cell.yes" : "pricing_page.cell.no")}</span>
    </>
  );
}

function TableRows({ rows }: { rows: Row[] }) {
  const { t } = useTranslation();
  return rows.map((row) => (
    <tr key={row.key}>
      <th scope="row">{t(`pricing_page.row_labels.${row.key}`)}</th>
      {row.cell.map((c, i) => (
        <td key={PLAN_ORDER[i]} className={cn(PLAN_ORDER[i] === HIGHLIGHT_PLAN && "is-hl")}>
          <PlanCell kind={c} />
        </td>
      ))}
    </tr>
  ));
}

export default function PricingPage() {
  const { t } = useTranslation();
  const { company } = useCompany();
  const [tierIndex, setTierIndex] = useState(0);

  return (
    <div className="mkt-page">
      <section className="mkt-section mkt-section--alt mkt-price-top" aria-labelledby="mkt-price-title">
        <div className="mkt-container mkt-price-head">
          <div className="mkt-price-intro">
            <span className="mkt-label">{t("pricing_page.hero.label")}</span>
            <h1 id="mkt-price-title">{t("pricing_page.hero.title")}</h1>
            <p className="mkt-price-copy">{t("pricing_page.hero.subtitle")}</p>
          </div>

          <fieldset className="mkt-price-tiers">
            <legend>{t("pricing_page.tier_label")}</legend>
            <div className="mkt-price-tiers__grid">
              {TIER_INDEXES.map((i) => (
                <span key={i} className="mkt-price-tier">
                  <input
                    type="radio"
                    name="pricing-tier"
                    id={`mkt-price-tier-${i}`}
                    value={i}
                    checked={tierIndex === i}
                    onChange={() => setTierIndex(i)}
                  />
                  <label htmlFor={`mkt-price-tier-${i}`}>{t(`pricing_page.tiers.${i}`)}</label>
                </span>
              ))}
            </div>
          </fieldset>

          <div className="mkt-price-plans">
            {PLAN_ORDER.map((plan) => {
              const highlighted = plan === HIGHLIGHT_PLAN;
              return (
                <article key={plan} className="mkt-price-plan" aria-labelledby={`mkt-price-plan-${plan}`}>
                  <h2 id={`mkt-price-plan-${plan}`} className="mkt-price-plan__name">{t(`pricing_page.plans.${plan}.name`)}</h2>
                  <div className="mkt-price-plan__body">
                    {highlighted && <p className="mkt-price-plan__flag">{t("pricing_page.popular")}</p>}
                    <p className="mkt-price-plan__desc">{t(`pricing_page.plans.${plan}.description`)}</p>
                    <p className="mkt-price-plan__price" aria-live="polite">
                      {formatBdt(MONTHLY_BDT[plan][tierIndex])}
                      <span className="mkt-price-plan__unit"> {t("pricing_page.per_month_suffix")}</span>
                    </p>
                    <p className="mkt-price-plan__from">
                      {t("pricing_page.plans.from", { price: formatBdt(MONTHLY_BDT[plan][0]) })}
                    </p>
                    <Link href="/demo-request" className="mkt-btn">
                      {t("pricing_page.cta")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-price-compare" aria-labelledby="mkt-price-compare-title">
        <div className="mkt-container">
          <span className="mkt-label">{t("pricing_page.compare_label")}</span>
          <h2 id="mkt-price-compare-title" className="mkt-price-h2">
            {t("pricing_page.compare_title")}
            <span className="mkt-title-sub">{t("pricing_page.compare_sub")}</span>
          </h2>
          <p className="mkt-price-copy">{t("pricing_page.compare_subtitle")}</p>

          <table className="mkt-price-table">
            <thead>
              <tr>
                <th scope="col">{t("pricing_page.table.feature_column")}</th>
                {PLAN_ORDER.map((p) => (
                  <th key={p} scope="col" className={cn(p === HIGHLIGHT_PLAN && "is-hl")}>
                    {t(`pricing_page.plans.${p}.name`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableRows rows={FEATURE_ROWS} />
            </tbody>
            <tbody>
              <tr className="mkt-price-table__group">
                <th scope="colgroup" colSpan={4}>{t("pricing_page.table.addons")}</th>
              </tr>
              <TableRows rows={ADDON_ROWS} />
            </tbody>
          </table>

          <ul className="mkt-price-notes">
            <li>{t("pricing_page.footnote_2")}</li>
            <li>{t("pricing_page.footnote_3")}</li>
          </ul>
        </div>
      </section>

      <section className="mkt-night mkt-price-custom" aria-labelledby="mkt-price-custom-title">
        <div className="mkt-container mkt-price-custom__inner">
          <div className="mkt-price-custom__head">
            <span className="mkt-label">{t("pricing_page.custom.label")}</span>
            <h2 id="mkt-price-custom-title" className="mkt-price-h2">
              {t("pricing_page.custom.title")}
              <span className="mkt-title-sub">{t("pricing_page.custom.sub")}</span>
            </h2>
            <p className="mkt-price-copy">{t("pricing_page.custom.subtitle")}</p>
            <div className="mkt-price-custom__actions">
              <Link href="/demo-request" className="mkt-btn">
                {t("pricing_page.custom.primary_cta")}
              </Link>
              {company.email && (
                <a href={`mailto:${company.email}`} className="mkt-btn">
                  {t("pricing_page.custom.secondary_cta")}
                </a>
              )}
            </div>
          </div>
          <dl className="mkt-price-custom__rows">
            {CUSTOM_ITEMS.map((k) => (
              <div key={k}>
                <dt>{t(`pricing_page.custom.${k}`)}</dt>
                <dd>{t(`pricing_page.custom.${k}_desc`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

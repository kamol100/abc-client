"use client";

import "@/components/marketing/modules/module-detail.css";
import "@/components/marketing/home/home.css";
import type { ComponentType } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import HomeHero from "@/components/marketing/home/home-hero";
import { BillingSample, MessagingSample, MikrotikSample, NocSample, OltSample, SubscribersSample } from "@/components/marketing/modules/samples-a";
import { FinanceSample, InventorySample, PortalSample, ReportsSample, ResellersSample, SupportSample } from "@/components/marketing/modules/samples-b";
import type { ModuleId } from "@/components/marketing/modules/module-types";
import { HIGHLIGHT_PLAN, MONTHLY_BDT, PLAN_ORDER, formatBdt } from "@/components/marketing/pricing/pricing-data";
import Hl from "@/components/marketing/hl";

const K = "marketing.home";

const MODULES: [ModuleId, ComponentType][] = [
  ["subscribers", SubscribersSample],
  ["billing", BillingSample],
  ["mikrotik", MikrotikSample],
  ["olt", OltSample],
  ["noc", NocSample],
  ["messaging", MessagingSample],
  ["support", SupportSample],
  ["resellers", ResellersSample],
  ["finance", FinanceSample],
  ["inventory", InventorySample],
  ["reports", ReportsSample],
  ["portal", PortalSample],
];

const OPS: [ModuleId, ComponentType][] = [
  ["noc", NocSample],
  ["mikrotik", MikrotikSample],
  ["olt", OltSample],
];

/** A built screen shrunk into a fixed box, shown like a product photo. */
function Shot({ Sample, className }: { Sample: ComponentType; className?: string }) {
  return (
    <div className={cn("mkt-home-shot", className)} aria-hidden="true">
      <div className="mkt-home-shot__inner">
        <Sample />
      </div>
    </div>
  );
}

/** MikroTik's section opening: label, bold head, light second line. */
function Head({ id }: { id: string }) {
  const { t } = useTranslation();
  return (
    <>
      <span className="mkt-label">{t(`${K}.${id}.label`)}</span>
      <h2>
        <Hl k={`${K}.${id}.title`} />
        <span className="mkt-title-sub">{t(`${K}.${id}.sub`)}</span>
      </h2>
    </>
  );
}

function ModulesSection() {
  const { t } = useTranslation();
  return (
    <section id="features" className="mkt-section mkt-home-sec">
      <div className="mkt-container">
        <Head id="modules" />
        <p className="mkt-home-text">{t(`${K}.modules.text`)}</p>
        <ul className="mkt-home-grid">
          {MODULES.map(([id, Sample]) => (
            <li key={id}>
              <Link href={`/features/${id}`} className="mkt-home-card">
                <span className="mkt-home-card__name">{t(`${K}.modules.names.${id}`)}</span>
                <Shot Sample={Sample} />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mkt-home-center">
          <Link href="/features" className="mkt-btn">
            {t(`${K}.modules.all`)}
          </Link>
        </div>
      </div>
    </section>
  );
}

function OpsSection() {
  const { t } = useTranslation();
  return (
    <section className="mkt-night mkt-home-sec mkt-home-ops">
      <div className="mkt-container">
        <Head id="ops" />
        <ul className="mkt-home-ops__grid">
          {OPS.map(([id, Sample]) => (
            <li key={id}>
              <Link href={`/features/${id}`} className="mkt-home-tile">
                <Shot Sample={Sample} className="mkt-home-shot--night" />
                <span className="mkt-home-tile__title">{t(`${K}.ops.cards.${id}.title`)}</span>
                <span className="mkt-home-tile__text mkt-muted">{t(`${K}.ops.cards.${id}.text`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BillingSection() {
  const { t } = useTranslation();
  return (
    <section className="mkt-section mkt-section--alt mkt-home-sec">
      <div className="mkt-container">
        <Head id="billing" />
        <p className="mkt-home-text">{t(`${K}.billing.text`)}</p>
        <Link href="/features/billing" className="mkt-btn mkt-home-btn">
          {t(`${K}.billing.button`)}
        </Link>
        <ul className="mkt-home-pair">
          {(["receipts", "quickpay"] as const).map((c) => (
            <li key={c} className="mkt-home-grey">
              <span className="mkt-home-grey__label">{t(`${K}.billing.cards.${c}.label`)}</span>
              <span className="mkt-home-grey__fig">{t(`${K}.billing.cards.${c}.fig`)}</span>
              <p className="mkt-home-grey__text">{t(`${K}.billing.cards.${c}.text`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BangladeshSection() {
  const { t } = useTranslation();
  return (
    <section id="about" className="mkt-section mkt-home-sec">
      <div className="mkt-container">
        <Head id="bangladesh" />
        <dl className="mkt-home-specs">
          {(["bkash", "btrc", "lang", "app"] as const).map((r) => (
            <div key={r}>
              <dt>{t(`${K}.bangladesh.rows.${r}.title`)}</dt>
              <dd>{t(`${K}.bangladesh.rows.${r}.line`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function PricingSection() {
  const { t } = useTranslation();
  return (
    <section id="pricing" className="mkt-section mkt-section--alt mkt-home-sec">
      <div className="mkt-container">
        <Head id="pricing" />
        <ul className="mkt-home-plans">
          {PLAN_ORDER.map((plan) => (
            <li key={plan} className={cn("mkt-home-plan", plan === HIGHLIGHT_PLAN && "mkt-home-plan--lead")}>
              <h3 className="mkt-home-plan__name">{t(`${K}.pricing.plans.${plan}`)}</h3>
              <p className="mkt-home-plan__price">
                <span>{t(`${K}.pricing.from`)}</span>
                <span className="mkt-home-plan__fig">{formatBdt(MONTHLY_BDT[plan][0])}</span>
                <span>{t(`${K}.pricing.per_month`)}</span>
              </p>
              <Link href="/demo-request" className="mkt-btn">
                {t(`${K}.pricing.demo`)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mkt-home-center">
          <Link href="/pricing" className="mkt-btn">
            {t(`${K}.pricing.compare`)}
          </Link>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const { t } = useTranslation();
  return (
    <section id="cta" className="mkt-night mkt-home-sec mkt-home-cta">
      <div className="mkt-container">
        <Head id="cta" />
        <Link href="/demo-request" className="mkt-btn mkt-home-btn">
          {t(`${K}.cta.button`)}
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="mkt-page mkt-home">
      <HomeHero />
      <ModulesSection />
      <OpsSection />
      <BillingSection />
      <BangladeshSection />
      <PricingSection />
      <CtaSection />
    </div>
  );
}

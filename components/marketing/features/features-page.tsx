"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { MODULE_IDS, type ModuleId } from "@/components/marketing/modules/module-types";
import { MODULES } from "@/components/marketing/modules/registry";
import { ModuleCard } from "@/components/marketing/modules/module-detail";
import "@/components/marketing/features/features.css";

const P = "features_page";

type Block = { id: ModuleId | "platform"; specs: string[]; sample?: boolean; flip?: boolean };

// ids are linked from the home page and the nav: keep them.
const BLOCKS: Block[] = [
  { id: "subscribers", specs: ["profile", "terms", "actions", "page", "import"] },
  { id: "billing", sample: true, specs: ["invoices", "online", "receipts", "automation"] },
  { id: "mikrotik", specs: ["routers", "resync", "queries"] },
  { id: "olt", sample: true, flip: true, specs: ["access", "onu", "uptime"] },
  { id: "noc", sample: true, specs: ["screen", "outage", "maps"] },
  { id: "messaging", sample: true, flip: true, specs: ["bulk", "templates", "telegram"] },
  { id: "support", specs: ["status", "portal", "olt"] },
  { id: "resellers", specs: ["billing", "commission", "switch"] },
  { id: "finance", specs: ["funds", "expenses", "payroll"] },
  { id: "inventory", specs: ["products", "stock_in", "stock_out"] },
  { id: "reports", specs: ["money", "stock", "dashboard"] },
  { id: "portal", specs: ["login", "dashboard", "quick_pay", "links"] },
  { id: "platform", specs: ["saas", "permissions", "audit", "language", "app"] },
];

// mikrotik.com alternates white and grey bands, with one black band in the middle.
const NIGHT: Block["id"] = "noc";

function FeatureBlock({ block, index }: { block: Block; index: number }) {
  const { t } = useTranslation();
  const base = `${P}.modules.${block.id}`;
  const name = t(`${base}.name`);
  const Sample = block.sample && block.id !== "platform" ? MODULES[block.id]?.Sample : undefined;
  const night = block.id === NIGHT;

  const opening = (
    <>
      <span className="mkt-label">{name}</span>
      <h2 id={`${block.id}-title`} className="mkt-feat-h2">
        {t(`${base}.title`)}
        <span className="mkt-title-sub">{t(`${base}.sub`)}</span>
      </h2>
      <p className="mkt-feat-copy">{t(`${base}.summary`)}</p>
    </>
  );
  const specs = (
    <dl className={cn("mkt-feat-specs", Sample ? "mkt-feat-specs--list" : "mkt-feat-specs--cols")}>
      {block.specs.map((k) => (
        <div key={k}>
          <dt>{t(`${base}.specs.${k}.term`)}</dt>
          <dd>{t(`${base}.specs.${k}.desc`)}</dd>
        </div>
      ))}
    </dl>
  );
  const action =
    block.id === "platform" ? null : (
      <Link href={`/features/${block.id}`} className="mkt-btn">
        {t(`${P}.details`)}
        <span className="visually-hidden"> {name}</span>
      </Link>
    );

  return (
    <section
      id={block.id}
      aria-labelledby={`${block.id}-title`}
      className={cn("mkt-section mkt-feat-block", night ? "mkt-night" : index % 2 === 0 && "mkt-section--alt")}
    >
      {Sample ? (
        <div className={cn("mkt-container mkt-feat-product", block.flip && "mkt-feat-product--flip")}>
          <figure className="mkt-feat-slot" data-slot={`module-${block.id}`}>
            <Sample />
          </figure>
          <div className="mkt-feat-text">
            {opening}
            {specs}
            {action}
          </div>
        </div>
      ) : (
        <div className="mkt-container">
          {opening}
          {specs}
          {action}
        </div>
      )}
    </section>
  );
}

export default function FeaturesPage() {
  const { t } = useTranslation();

  return (
    <div className="mkt-page">
      <section className="mkt-section mkt-feat-top" aria-labelledby="mkt-feat-title">
        <div className="mkt-container">
          <span className="mkt-label">{t(`${P}.head.label`)}</span>
          <h1 id="mkt-feat-title">{t(`${P}.head.title`)}</h1>
          <p className="mkt-feat-copy">{t(`${P}.head.lead`)}</p>
          <Link href="/demo-request" className="mkt-btn mkt-feat-top-btn">
            {t(`${P}.head.cta`)}
          </Link>
          <ul className="mkt-mod-cards" aria-label={t(`${P}.grid_label`)}>
            {MODULE_IDS.map((id) => (
              <li key={id}>
                <ModuleCard id={id} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {BLOCKS.map((b, i) => (
        <FeatureBlock key={b.id} block={b} index={i} />
      ))}
    </div>
  );
}

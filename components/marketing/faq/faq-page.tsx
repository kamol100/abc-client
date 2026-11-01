"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { MONTHLY_BDT, TIER_COUNT, formatBdt } from "@/components/marketing/pricing/pricing-data";
import "@/components/marketing/faq/faq.css";
import Hl from "@/components/marketing/hl";

const GROUPS = [
  { key: "start", items: ["what", "who", "bangla", "phone", "btrc"] },
  { key: "network", items: ["routers", "import", "olts", "signal", "reboot", "noc"] },
  { key: "billing", items: ["plans", "auto", "partial", "gateway", "receipts"] },
  { key: "people", items: ["login", "quickpay", "tickets", "resellers"] },
  { key: "messaging", items: ["gateway", "cost", "telegram"] },
  { key: "pricing", items: ["plans", "cost", "vat"] },
] as const;

const LAST = TIER_COUNT - 1;

// Prices come from the pricing page's own table so the answers never drift from it.
const PRICES = {
  b0: formatBdt(MONTHLY_BDT.basic[0]),
  s0: formatBdt(MONTHLY_BDT.standard[0]),
  p0: formatBdt(MONTHLY_BDT.premium[0]),
  b7: formatBdt(MONTHLY_BDT.basic[LAST]),
  s7: formatBdt(MONTHLY_BDT.standard[LAST]),
  p7: formatBdt(MONTHLY_BDT.premium[LAST]),
};

const key = (group: string, item: string, part: "q" | "a") =>
  `faq_page.groups.${group}.items.${item}.${part}`;

export default function FaqPage() {
  const { t, i18n } = useTranslation();

  // FAQPage structured data stays English whatever the visitor's language.
  const en = i18n.getFixedT("en");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: en(key(g.key, item, "q")),
        acceptedAnswer: { "@type": "Answer", text: en(key(g.key, item, "a"), PRICES) },
      })),
    ),
  };

  return (
    <div className="mkt-page mkt-faq">
      <header className="mkt-section mkt-section--alt mkt-faq-head">
        <div className="mkt-container">
          <span className="mkt-label">{t("faq_page.label")}</span>
          <h1><Hl k="faq_page.title" /></h1>
          <p className="mkt-faq-copy">{t("faq_page.lead")}</p>
        </div>
      </header>

      <div className="mkt-container mkt-faq-body">
        <nav className="mkt-faq-index" aria-label={t("faq_page.index_label")}>
          <ol>
            {GROUPS.map((g) => (
              <li key={g.key}>
                <a href={`#faq-${g.key}`}><Hl k={`faq_page.groups.${g.key}.title`} plain /></a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mkt-faq-groups">
          {GROUPS.map((g) => (
            <section key={g.key} id={`faq-${g.key}`} className="mkt-faq-group" aria-labelledby={`faq-${g.key}-title`}>
              <h2 id={`faq-${g.key}-title`}><Hl k={`faq_page.groups.${g.key}.title`} /></h2>
              {g.items.map((item) => (
                <details key={item} className="mkt-faq-item">
                  <summary>
                    <span>{t(key(g.key, item, "q"))}</span>
                    <ChevronDown className="mkt-faq-chevron" strokeWidth={1.25} aria-hidden="true" />
                  </summary>
                  <p>{t(key(g.key, item, "a"), PRICES)}</p>
                </details>
              ))}
            </section>
          ))}
        </div>
      </div>

      <section className="mkt-night mkt-faq-band">
        <div className="mkt-container">
          <span className="mkt-label">{t("faq_page.band.label")}</span>
          <h2 className="mkt-faq-h2">
            <Hl k="faq_page.band.title" />
            <span className="mkt-title-sub">{t("faq_page.band.sub")}</span>
          </h2>
          <p className="mkt-faq-copy">{t("faq_page.band.lead")}</p>
          <Link href="/demo-request" className="mkt-btn mkt-faq-band-btn">
            {t("faq_page.band.cta")}
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        // Our own translation strings; `<` is escaped so a key can never close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}

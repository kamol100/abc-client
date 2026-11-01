"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useCompany } from "@/context/company-provider";
import "@/components/marketing/about/about.css";
import Hl from "@/components/marketing/hl";

// Same ids as the nav's module menu (marketing.nav.modules) and the /features/<id> pages.
const MODULES = [
  "subscribers",
  "billing",
  "mikrotik",
  "olt",
  "noc",
  "messaging",
  "support",
  "resellers",
  "finance",
  "inventory",
  "reports",
  "portal",
] as const;

const LOCAL_FACTS = ["payment", "btrc", "language", "brand", "routers", "olt"] as const;

export default function AboutPage() {
  const { t } = useTranslation();
  const { company } = useCompany();
  const name = company.name || "ISPTik";
  const phone = company.phone?.trim();
  const email = company.email?.trim();
  const address = company.address?.trim();
  const hasContact = Boolean(phone || email || address);

  return (
    <div className="mkt-page mkt-about">
      <section className="mkt-section mkt-section--alt mkt-about-hero" aria-labelledby="about-title">
        <div className="mkt-container">
          <span className="mkt-label">{t("about_page.hero.label")}</span>
          <h1 id="about-title"><Hl k="about_page.hero.title" values={{ name }} /></h1>
          <p className="mkt-about-copy">{t("about_page.hero.lead", { name })}</p>
          <Link href="/demo-request" className="mkt-btn mkt-about-btn">
            {t("about_page.hero.cta")}
          </Link>
        </div>
      </section>

      <section className="mkt-section" aria-labelledby="about-modules">
        <div className="mkt-container">
          <span className="mkt-label">{t("about_page.modules.label")}</span>
          <h2 id="about-modules" className="mkt-about-h2">
            <Hl k="about_page.modules.title" />
            <span className="mkt-title-sub">{t("about_page.modules.sub")}</span>
          </h2>
          <p className="mkt-about-copy">{t("about_page.modules.lead")}</p>
          <ul className="mkt-about-index">
            {MODULES.map((id) => (
              <li key={id}>
                <Link href={`/features/${id}`} className="mkt-about-index__link">
                  <span className="mkt-about-index__name">{t(`marketing.nav.modules.${id}`)}</span>
                  <span className="mkt-about-index__note">{t(`marketing.nav.module_notes.${id}`)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mkt-section mkt-section--alt" aria-labelledby="about-local">
        <div className="mkt-container mkt-about-split">
          <div>
            <span className="mkt-label">{t("about_page.local.label")}</span>
            <h2 id="about-local" className="mkt-about-h2">
              <Hl k="about_page.local.title" />
              <span className="mkt-title-sub">{t("about_page.local.sub")}</span>
            </h2>
            <p className="mkt-about-copy">{t("about_page.local.lead")}</p>
          </div>
          <dl className="mkt-about-spec">
            {LOCAL_FACTS.map((key) => (
              <div key={key} className="mkt-about-spec__row">
                <dt>{t(`about_page.local.rows.${key}.label`)}</dt>
                <dd>{t(`about_page.local.rows.${key}.value`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mkt-section" aria-labelledby="about-story">
        <div className="mkt-container mkt-about-split">
          <div>
            <span className="mkt-label">{t("about_page.story.label")}</span>
            <h2 id="about-story" className="mkt-about-h2">
              <Hl k="about_page.story.title" values={{ name }} />
              <span className="mkt-title-sub">{t("about_page.story.sub")}</span>
            </h2>
            {/* Owner slot: replace this span with the company's own story. */}
            <p className="mkt-about-copy">
              <span className="mkt-about-fill" data-fill="story">
                {t("about_page.story.slot", { name })}
              </span>
            </p>
          </div>
          {hasContact && (
            <div className="mkt-about-contact">
              <h3>{t("about_page.contact.title", { name })}</h3>
              <dl className="mkt-about-spec">
                {address && (
                  <div className="mkt-about-spec__row">
                    <dt>{t("about_page.contact.address")}</dt>
                    <dd>{address}</dd>
                  </div>
                )}
                {phone && (
                  <div className="mkt-about-spec__row">
                    <dt>{t("about_page.contact.phone")}</dt>
                    <dd>
                      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="mkt-about-contact__link">
                        {phone}
                      </a>
                    </dd>
                  </div>
                )}
                {email && (
                  <div className="mkt-about-spec__row">
                    <dt>{t("about_page.contact.email")}</dt>
                    <dd>
                      <a href={`mailto:${email}`} className="mkt-about-contact__link">
                        {email}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </section>

      <section className="mkt-night mkt-about-close" aria-labelledby="about-close">
        <div className="mkt-container">
          <span className="mkt-label">{t("about_page.close.label")}</span>
          <h2 id="about-close" className="mkt-about-h2">
            <Hl k="about_page.close.title" />
            <span className="mkt-title-sub">{t("about_page.close.sub")}</span>
          </h2>
          <p className="mkt-about-copy">{t("about_page.close.lead")}</p>
          <Link href="/demo-request" className="mkt-btn mkt-about-btn">
            {t("about_page.close.cta")}
          </Link>
        </div>
      </section>
    </div>
  );
}

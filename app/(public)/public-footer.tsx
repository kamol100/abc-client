"use client";

import "@/components/marketing/chrome.css";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useCompany } from "@/context/company-provider";
import { CLIENT_LOGIN_PATH } from "@/lib/auth/routes";
import { MODULE_IDS, PAGE_LINKS, moduleHref } from "@/app/(public)/public-top-nav";

export default function PublicFooter() {
  const { company, logoUrl } = useCompany();
  const { t } = useTranslation();
  const name = company.name ?? "ISPTik";
  const hasContact = Boolean(company.address || company.phone || company.email);

  return (
    <footer className="mkt-foot">
      <div className="mkt-container">
        <div className="mkt-foot-top">
          <Link href="/home" className="mkt-foot-logo">
            <img src={logoUrl} alt={company.name ? "" : name} />
            {company.name && <span>{company.name}</span>}
          </Link>
          <Link href="/demo-request" className="mkt-btn">{t("marketing.nav.demo_request")}</Link>
        </div>

        <div className="mkt-foot-cols">
          <nav aria-labelledby="mkt-foot-pages">
            <h2 id="mkt-foot-pages" className="mkt-foot-head">{t("marketing.footer.pages")}</h2>
            <ul>
              <li><Link href="/features">{t("marketing.nav.features")}</Link></li>
              {PAGE_LINKS.map((item) => (
                <li key={item.href}><Link href={item.href}>{t(item.key)}</Link></li>
              ))}
              <li><Link href={CLIENT_LOGIN_PATH}>{t("marketing.nav.login")}</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="mkt-foot-modules" className="mkt-foot-modules-col">
            <h2 id="mkt-foot-modules" className="mkt-foot-head">{t("marketing.footer.modules")}</h2>
            <ul className="mkt-foot-modules">
              {MODULE_IDS.map((id) => (
                <li key={id}><Link href={moduleHref(id)}>{t(`marketing.nav.modules.${id}`)}</Link></li>
              ))}
            </ul>
          </nav>

          {hasContact && (
            <div>
              <h2 className="mkt-foot-head">{t("marketing.footer.contact")}</h2>
              <address className="mkt-foot-contact">
                {company.address && <p>{company.address}</p>}
                {company.phone && <a href={`tel:${company.phone.replace(/\s+/g, "")}`}>{company.phone}</a>}
                {company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}
              </address>
            </div>
          )}
        </div>

        <div className="mkt-foot-bottom">
          <p>{t("marketing.footer.copyright", { name, year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}

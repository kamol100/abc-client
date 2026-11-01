"use client";

import "@/components/marketing/chrome.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronDown, CircleUser, Menu, X } from "lucide-react";
import { useCompany } from "@/context/company-provider";
import { useLanguage } from "@/hooks/use-language";
import { LANGUAGES, LANGUAGE_LABELS } from "@/lib/i18n/languages";
import { CLIENT_LOGIN_PATH } from "@/lib/auth/routes";

export const MODULE_IDS = [
  "subscribers", "billing", "mikrotik", "olt", "noc", "messaging",
  "support", "resellers", "finance", "inventory", "reports", "portal",
] as const;

export const PAGE_LINKS = [
  { key: "marketing.nav.pricing", href: "/pricing" },
  { key: "marketing.nav.faq", href: "/faq" },
  { key: "marketing.nav.about", href: "/about" },
  { key: "marketing.nav.pay_bill", href: "/pay" },
  { key: "marketing.nav.demo_request", href: "/demo-request" },
] as const;

/* Same switch as components/language-switcher.tsx, drawn as MikroTik's quiet text toggle. */
const LANGUAGE_SHORT = { en: "EN", bn: "বাং" } as const;

function LanguageToggle() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  return (
    <div className="mkt-nav-lang" role="group" aria-label={t("marketing.nav.language")}>
      {LANGUAGES.map((lang, i) => (
        <span key={lang} className="mkt-nav-lang-item">
          {i > 0 && <span aria-hidden="true">/</span>}
          <button
            type="button"
            lang={lang}
            aria-label={LANGUAGE_LABELS[lang]}
            aria-pressed={language === lang}
            onClick={() => setLanguage(lang)}
          >
            {LANGUAGE_SHORT[lang]}
          </button>
        </span>
      ))}
    </div>
  );
}

export const moduleHref = (id: string) => `/features/${id}`;

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export default function PublicTopNav() {
  const { company, logoUrl } = useCompany();
  const { t } = useTranslation();
  const pathname = usePathname();
  const over = pathname === "/home" || pathname === "/";

  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const featuresButtonRef = useRef<HTMLButtonElement>(null);
  const hoverRef = useRef(false);

  // Close every menu on route change (adjusting state during render, no effect).
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setFeaturesOpen(false);
    setMobileOpen(false);
  }

  const closeAll = () => {
    setFeaturesOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    if (!featuresOpen && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (featuresOpen) featuresButtonRef.current?.focus();
      closeAll();
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) closeAll();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [featuresOpen, mobileOpen]);

  // Mobile only (the CSS applies the transform below 64rem): hide on scroll down, show on scroll up.
  useEffect(() => {
    let prev = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 100 && y > prev);
      prev = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = (href: string) => (isActive(pathname, href) ? "page" : undefined);
  const featuresActive = isActive(pathname, "/features");

  return (
    <header
      ref={headerRef}
      className="mkt-nav"
      data-over={over || undefined}
      data-hidden={hidden || undefined}
      data-open={mobileOpen || undefined}
    >
      <div className="mkt-container mkt-nav-bar">
        <Link href="/home" className="mkt-nav-logo" aria-current={current("/home")}>
          <img src={logoUrl} alt={company.name ? "" : t("marketing.nav.home")} />
          {company.name && <span>{company.name}</span>}
        </Link>

        <div className="mkt-nav-right">
          <nav className="mkt-nav-menu" aria-label={t("marketing.nav.main")}>
            <ul>
              <li
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  hoverRef.current = true;
                  setFeaturesOpen(true);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType !== "mouse") return;
                  hoverRef.current = false;
                  setFeaturesOpen(false);
                }}
              >
                <button
                  ref={featuresButtonRef}
                  type="button"
                  className="mkt-nav-link"
                  aria-expanded={featuresOpen}
                  aria-controls="mkt-nav-features"
                  data-active={featuresActive || undefined}
                  onClick={() => setFeaturesOpen((open) => hoverRef.current || !open)}
                >
                  {t("marketing.nav.features")}
                  <ChevronDown className="mkt-nav-chev" aria-hidden />
                </button>
                <div id="mkt-nav-features" className="mkt-nav-panel" data-open={featuresOpen || undefined}>
                  <div className="mkt-container mkt-nav-panel-grid">
                    <Link href="/features" className="mkt-nav-all" aria-current={pathname === "/features" ? "page" : undefined} onClick={closeAll}>
                      {t("marketing.nav.all_features")}
                    </Link>
                    <ul className="mkt-nav-modules">
                      {MODULE_IDS.map((id) => (
                        <li key={id}>
                          <Link href={moduleHref(id)} className="mkt-nav-module" aria-current={current(moduleHref(id))} onClick={closeAll}>
                            <strong>{t(`marketing.nav.modules.${id}`)}</strong>
                            <span>{t(`marketing.nav.module_notes.${id}`)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
              {PAGE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="mkt-nav-link" aria-current={current(item.href)}>
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mkt-nav-tools">
            <LanguageToggle />
            <Link href={CLIENT_LOGIN_PATH} className="mkt-nav-icon" aria-label={t("marketing.nav.login")}>
              <CircleUser aria-hidden />
            </Link>
            <button
              type="button"
              className="mkt-nav-icon mkt-nav-toggle"
              aria-label={t("marketing.nav.toggle_menu")}
              aria-expanded={mobileOpen}
              aria-controls="mkt-nav-mobile"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X aria-hidden /> : <Menu aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      <nav id="mkt-nav-mobile" className="mkt-nav-mobile" data-open={mobileOpen || undefined} aria-label={t("marketing.nav.main")}>
        <ul>
          <li className={mobileFeaturesOpen ? "mkt-nav-open" : undefined}>
            <button
              type="button"
              className="mkt-nav-row"
              aria-expanded={mobileFeaturesOpen}
              aria-controls="mkt-nav-mobile-features"
              onClick={() => setMobileFeaturesOpen((open) => !open)}
            >
              {t("marketing.nav.features")}
              <ChevronDown className="mkt-nav-chev" aria-hidden />
            </button>
            <ul id="mkt-nav-mobile-features" hidden={!mobileFeaturesOpen}>
              <li>
                <Link href="/features" className="mkt-nav-row mkt-nav-row--sub" aria-current={pathname === "/features" ? "page" : undefined} onClick={closeAll}>
                  {t("marketing.nav.all_features")}
                </Link>
              </li>
              {MODULE_IDS.map((id) => (
                <li key={id}>
                  <Link href={moduleHref(id)} className="mkt-nav-row mkt-nav-row--sub" aria-current={current(moduleHref(id))} onClick={closeAll}>
                    {t(`marketing.nav.modules.${id}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {[...PAGE_LINKS, { key: "marketing.nav.login", href: CLIENT_LOGIN_PATH }].map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="mkt-nav-row" aria-current={current(item.href)} onClick={closeAll}>
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

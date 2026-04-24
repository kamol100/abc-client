"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompany } from "@/context/company-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import MyButton from "@/components/my-button";

type NavItem = { key: string; href: string };

const SHARED_LINKS: NavItem[] = [
  { key: "marketing.nav.home", href: "/home" },
  { key: "marketing.nav.features", href: "/features" },
  { key: "marketing.nav.pricing", href: "/pricing" },
  // { key: "marketing.nav.about", href: "/home#about" },
];

const HOME_ANCHORS: NavItem[] = [
  { key: "marketing.nav.home", href: "/home" },
  { key: "marketing.nav.features", href: "/features" },
  { key: "marketing.nav.pricing", href: "/pricing" },
  // { key: "marketing.nav.about", href: "#about" },
];

export default function PublicTopNav() {
  const { company, logoUrl } = useCompany();
  const { t } = useTranslation();
  const pathname = usePathname();
  const isHomePage = pathname === "/home";
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = isHomePage ? HOME_ANCHORS : SHARED_LINKS;

  const renderNavItem = (item: NavItem, mobile: boolean) => {
    const isAnchor = item.href.startsWith("#");
    const isActive = !isAnchor && pathname === item.href;

    const classes = mobile
      ? cn(
        "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-foreground",
        isActive ? "text-foreground font-medium" : "text-muted-foreground"
      )
      : cn(
        "text-sm transition-colors hover:text-foreground",
        isActive ? "text-foreground font-medium" : "text-muted-foreground"
      );

    if (isAnchor) {
      return (
        <a
          key={item.href}
          href={item.href}
          className={classes}
          onClick={mobile ? () => setMobileOpen(false) : undefined}
        >
          {t(item.key)}
        </a>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={classes}
        onClick={mobile ? () => setMobileOpen(false) : undefined}
      >
        {t(item.key)}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/home" className="flex shrink-0 items-center gap-2.5">
          <img
            src={logoUrl}
            alt={company.name ?? ""}
            className="h-7 w-auto object-contain"
          />
          {company.name && (
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              {company.name}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => renderNavItem(item, false))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <MyButton url="/demo-request" size="sm" icon={false} variant="default">
            {t("marketing.nav.demo_request")}
          </MyButton>

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={t("marketing.nav.toggle_menu")}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t px-4 pb-3 pt-2 md:hidden">
          {navItems.map((item) => renderNavItem(item, true))}
        </nav>
      )}
    </header>
  );
}

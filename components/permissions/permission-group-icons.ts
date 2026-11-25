"use client";

import { KeyRound, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSetting } from "@/context/app-provider";
import { buildMenuConfig } from "@/hooks/use-menu-items";
import { applyMenuLayout, parseMenuLayout } from "@/lib/menu/menu-layout";

/** For groups with no menu item. */
export const FALLBACK_GROUP_ICON: LucideIcon = KeyRound;

/**
 * Groups that have no sidebar item of their own borrow the icon of the
 * group they belong with (stock in/out → products, SMS gateway → SMS…).
 */
const GROUP_ALIASES: Record<string, string> = {
  "dashboard-card": "dashboard",
  "products-in": "products",
  "products-out": "products",
  "wallet-transactions": "wallets",
  "reseller-wallet": "wallets",
  sms: "sms-send",
  "sms-gateway": "sms-send",
  "sms-store": "sms-send",
  impersonate: "users",
  notifications: "company-settings",
  "company-profile": "company-settings",
  "invoice-test": "invoices",
  "payment-methods": "payment-gateways",
  departments: "staffs",
};

type MenuIconSource = {
  icon: LucideIcon;
  permissions: string[];
  items?: { permission: string }[];
};

const groupOf = (permission: string): string => permission.split(".")[0] ?? permission;

/**
 * Permission group → the icon of the sidebar item that uses it. A group named in
 * an item's own permissions wins over one only used by a sub-item (so `funds`
 * gets the Funds icon, not the Reports icon); earlier menu items win ties.
 */
export function permissionGroupIcons(menu: MenuIconSource[]): Map<string, LucideIcon> {
  const icons = new Map<string, LucideIcon>();
  const claim = (permission: string, icon: LucideIcon) => {
    const group = groupOf(permission);
    if (!icons.has(group)) icons.set(group, icon);
  };

  menu.forEach((item) => item.permissions.forEach((permission) => claim(permission, item.icon)));
  menu.forEach((item) => item.items?.forEach((sub) => claim(sub.permission, item.icon)));

  Object.entries(GROUP_ALIASES).forEach(([group, target]) => {
    const icon = icons.get(target);
    if (icon && !icons.has(group)) icons.set(group, icon);
  });

  return icons;
}

/** The same icons the sidebar shows, including any an admin picked in Settings → Sidebar menu. */
export function usePermissionGroupIcon(): (group: string) => LucideIcon {
  const { t } = useTranslation();
  const savedLayout = useSetting("menu_layout");

  const icons = useMemo(() => {
    const menu = buildMenuConfig(t);
    // applyMenuLayout reorders too; take only its icons so ties keep the default menu order.
    const picked = new Map(
      applyMenuLayout(menu, parseMenuLayout(savedLayout)).map((item) => [item.id, item.icon] as const),
    );
    return permissionGroupIcons(menu.map((item) => ({ ...item, icon: picked.get(item.id) ?? item.icon })));
  }, [t, savedLayout]);

  return (group: string) => icons.get(group) ?? FALLBACK_GROUP_ICON;
}

import { useMemo } from "react";
import {
  Banknote,
  FileText,
  Headset,
  History,
  LayoutDashboard,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import type { NavMenuItem } from "@/hooks/use-menu-items";

interface ClientMenuItemConfig {
  id: number;
  title: string;
  url: string;
  icon: LucideIcon;
  permissions: string[];
}

function buildClientMenuConfig(t: (key: string) => string): ClientMenuItemConfig[] {
  return [
    {
      id: 1,
      title: t("menu.dashboard.title"),
      url: "/client/dashboard",
      icon: LayoutDashboard,
      permissions: ["client.dashboard"],
    },
    {
      id: 2,
      title: t("menu.invoice.title"),
      url: "/client/invoices",
      icon: FileText,
      permissions: ["client.invoices"],
    },
    {
      id: 4,
      title: t("menu.payments.title"),
      url: "/client/payments",
      icon: Banknote,
      permissions: ["client.invoices"],
    },
    {
      id: 5,
      title: t("menu.tickets.title"),
      url: "/client/tickets",
      icon: Headset,
      permissions: ["client.tickets"],
    },
  ];
}

export function useClientMenuItems(): NavMenuItem[] {
  const { t } = useTranslation();
  const { hasPermission, permissions } = usePermissions();

  return useMemo(() => {
    const config = buildClientMenuConfig(t);
    const hasAny = permissions.length > 0;

    return config
      .filter((item) => !hasAny || item.permissions.some((p) => hasPermission(p)))
      .map(({ id, title, url, icon }) => ({ id, title, url, icon }));
  }, [t, hasPermission, permissions]);
}

import { useMemo } from "react";
import {
  Banknote,
  Building2,
  CircleDollarSign,
  FileBarChart,
  FileText,
  Headset,
  History,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  Map,
  MapPin,
  MessageSquare,
  Network,
  Package,
  PackageOpen,
  Radio,
  Receipt,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldCheck,
  Store,
  SquareTerminal,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { usePermissions } from "@/context/app-provider";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────

interface MenuSubItemConfig {
  title: string;
  url: string;
  permission: string;
}

interface MenuItemConfig {
  id: number;
  title: string;
  url: string;
  icon: LucideIcon;
  permissions: string[];
  items?: MenuSubItemConfig[];
}

export interface NavMenuItem {
  id: number;
  title: string;
  url: string;
  icon: LucideIcon;
  items?: { title: string; url: string }[];
}

// ─── Menu Configuration ──────────────────────────────────────────────

function buildMenuConfig(t: (key: string) => string): MenuItemConfig[] {
  return [
    {
      id: 1,
      title: t("menu.dashboard.title"),
      url: "/dashboard",
      icon: LayoutDashboard,
      permissions: ["dashboard.access", "client.dashboard"],
    },
    {
      id: 2,
      title: t("menu.clients.title"),
      url: "/clients",
      icon: Users,
      permissions: ["clients.access"],
    },
    {
      id: 3,
      title: t("menu.reports.title"),
      url: "#",
      icon: FileBarChart,
      permissions: ["reports.access"],
      items: [
        { title: t("menu.reports.income_expense.title"), url: "/reports/income-expense", permission: "reports.access" },
        { title: t("menu.reports.funds.title"), url: "/reports/funds", permission: "funds.access" },
        { title: t("menu.reports.invoices.title"), url: "/reports/invoices", permission: "invoices.access" },
        { title: t("menu.reports.payments.title"), url: "/reports/payments", permission: "payments.access" },
        { title: t("menu.reports.expenses.title"), url: "/reports/expenses", permission: "expenses.access" },
        { title: t("menu.reports.product_in.title"), url: "/reports/product-in", permission: "products-in.report" },
        { title: t("menu.reports.product_out.title"), url: "/reports/product-out", permission: "products-in.report" },
      ],
    },
    {
      id: 4,
      title: t("menu.tickets.title"),
      url: "/client/tickets",
      icon: Headset,
      permissions: ["client.tickets"],
    },
    {
      id: 5,
      title: t("menu.invoice.title"),
      url: "/client/invoices",
      icon: FileText,
      permissions: ["client.invoices"],
    },
    {
      id: 6,
      title: t("menu.payment_due.title"),
      url: "/client/pay",
      icon: Receipt,
      permissions: ["client.invoices"],
    },
    {
      id: 7,
      title: t("menu.payments.title"),
      url: "/client/payments",
      icon: Banknote,
      permissions: ["client.invoices"],
    },
    {
      id: 8,
      title: t("menu.maps.title"),
      url: "#",
      icon: Map,
      permissions: ["clients.map"],
      items: [
        { title: t("menu.maps.client_maps.title"), url: "/client-maps", permission: "clients.map" },
        { title: t("menu.maps.tj_box_maps.title"), url: "/tj-box-maps", permission: "tj-boxes.map" },
        { title: t("menu.maps.tj_boxes.title"), url: "/tj-boxes", permission: "tj-boxes.access" },
      ],
    },
    {
      id: 9,
      title: t("menu.invoice.title"),
      url: "#",
      icon: FileText,
      permissions: ["invoices.access", "invoice-types.access"],
      items: [
        { title: t("menu.invoice.title"), url: "/invoices", permission: "invoices.access" },
        { title: t("menu.invoice.type.title"), url: "/invoice-types", permission: "invoice-types.access" },
      ],
    },
    {
      id: 10,
      title: t("menu.payments.title"),
      url: "#",
      icon: Banknote,
      permissions: ["payments.access", "payment-gateways.access"],
      items: [
        { title: t("menu.payments.title"), url: "/payments", permission: "products.access" },
        { title: t("menu.payments.gateways.title"), url: "/payment-gateways", permission: "payment-gateways.access" },
      ],
    },
    {
      id: 11,
      title: t("menu.products.title"),
      url: "#",
      icon: PackageOpen,
      permissions: ["products.access", "product-categories.access", "products-in.report", "unit-types.access"],
      items: [
        { title: t("menu.products.title"), url: "/products", permission: "products.access" },
        { title: t("menu.products.reports.title"), url: "/products/reports", permission: "products-in.report" },
        { title: t("menu.products.category.title"), url: "/product-categories", permission: "product-categories.access" },
        { title: t("menu.products.unit_types.title"), url: "/unit-types", permission: "unit-types.access" },
      ],
    },
    {
      id: 12,
      title: t("menu.expense.title"),
      url: "#",
      icon: CircleDollarSign,
      permissions: ["expenses.access", "expense-types.access"],
      items: [
        { title: t("menu.expense.title"), url: "/expenses", permission: "expenses.access" },
        { title: t("menu.expense.types.title"), url: "/expense-types", permission: "expense-types.access" },
      ],
    },
    {
      id: 13,
      title: t("menu.support_tickets.title"),
      url: "#",
      icon: LifeBuoy,
      permissions: ["tickets.access", "subjects.access", "tags.access"],
      items: [
        { title: t("menu.support_tickets.title"), url: "/tickets", permission: "tickets.access" },
        { title: t("menu.support_tickets.subjects.title"), url: "/subjects", permission: "subjects.access" },
        { title: t("menu.support_tickets.tags.title"), url: "/tags", permission: "tags.access" },
      ],
    },
    {
      id: 14,
      title: t("menu.resellers.title"),
      url: "/resellers",
      icon: UserCheck,
      permissions: ["resellers.access"],
    },
    {
      id: 15,
      title: t("menu.communication.title"),
      url: "#",
      icon: Radio,
      permissions: ["communication-gateways.access", "communication-logs.access", "communication-queue.access"],
      items: [
        { title: t("menu.communication.gateways.title"), url: "/communication-gateways", permission: "communication-gateways.access" },
        { title: t("menu.communication.queue.title"), url: "/communication-queue", permission: "communication-queue.access" },
        { title: t("menu.communication.logs.title"), url: "/communication-logs", permission: "communication-logs.access" },
      ],
    },
    {
      id: 16,
      title: t("menu.sms.title"),
      url: "#",
      icon: MessageSquare,
      permissions: ["sms-send.access", "sms-templates.access"],
      items: [
        { title: t("menu.sms.send.title"), url: "/sms-send", permission: "sms-send.access" },
        { title: t("menu.sms.templates.title"), url: "/sms-templates", permission: "sms-templates.access" },
      ],
    },
    {
      id: 17,
      title: t("menu.networks.title"),
      url: "#",
      icon: Network,
      permissions: ["networks.access", "devices.access", "device-types.access"],
      items: [
        { title: t("menu.networks.title"), url: "/networks", permission: "networks.access" },
        { title: t("menu.networks.devices.title"), url: "/devices", permission: "devices.access" },
        { title: t("menu.networks.device_type.title"), url: "/device-types", permission: "device-types.access" },
      ],
    },
    {
      id: 18,
      title: t("menu.mikrotik_commands.title"),
      url: "/mikrotik-commands",
      icon: SquareTerminal,
      permissions: ["mikrotik-command.access"],
    },
    {
      id: 19,
      title: t("menu.activity_logs.title"),
      url: "/activity-logs",
      icon: ScrollText,
      permissions: ["activity-logs.access"],
    },
    {
      id: 20,
      title: t("menu.history.title"),
      url: "/histories",
      icon: History,
      permissions: ["histories.access"],
    },
    {
      id: 21,
      title: t("menu.zones.title"),
      url: "#",
      icon: MapPin,
      permissions: ["zones.access", "sub-zones.access"],
      items: [
        { title: t("menu.zones.title"), url: "/zones", permission: "zones.access" },
        { title: t("menu.zones.sub_zone.title"), url: "/sub-zones", permission: "sub-zones.access" },
      ],
    },
    {
      id: 22,
      title: t("menu.packages.title"),
      url: "#",
      icon: Package,
      permissions: ["packages.access", "resellers.access"],
      items: [
        { title: t("menu.packages.mikrotik_package.title"), url: "/mikrotik-packages", permission: "mikrotik-packages.access" },
        { title: t("menu.packages.client_package.title"), url: "/client-packages", permission: "packages.access" },
        { title: t("menu.packages.reseller_package.title"), url: "/reseller-packages", permission: "resellers.access" },
      ],
    },
    {
      id: 23,
      title: t("menu.vendors.title"),
      url: "/vendors",
      icon: Store,
      permissions: ["vendors.access"],
    },
    {
      id: 24,
      title: t("menu.funds.title"),
      url: "#",
      icon: Landmark,
      permissions: ["funds.access", "fund-transactions.access"],
      items: [
        { title: t("menu.funds.title"), url: "/funds", permission: "funds.access" },
        { title: t("menu.funds.transaction.title"), url: "/fund-transactions", permission: "fund-transactions.access" },
      ],
    },
    {
      id: 25,
      title: t("menu.staffs.title"),
      url: "#",
      icon: UserCog,
      permissions: ["staffs.access", "salaries.access"],
      items: [
        { title: t("menu.staffs.title"), url: "/staffs", permission: "staffs.access" },
        { title: t("menu.staffs.salaries.title"), url: "/salaries", permission: "salaries.access" },
      ],
    },
    {
      id: 26,
      title: t("menu.wallets.title"),
      url: "#",
      icon: Wallet,
      permissions: ["wallets.access"],
      items: [
        { title: t("menu.wallets.my_wallets.title"), url: "/my-wallets", permission: "wallets.access" },
        { title: t("menu.wallets.client_wallets.title"), url: "/client-wallets", permission: "wallets.access" },
      ],
    },
    {
      id: 27,
      title: t("menu.users.title"),
      url: "/users",
      icon: Users,
      permissions: ["users.access"],
    },
    {
      id: 28,
      title: t("menu.companies.title"),
      url: "/companies",
      icon: Building2,
      permissions: ["companies.access"],
    },
    {
      id: 29,
      title: t("menu.mikrotik_sync.title"),
      url: "#",
      icon: RefreshCw,
      permissions: ["sync-clients.access", "client-sync.access"],
      items: [
        { title: t("menu.mikrotik_sync.import.title"), url: "/import-client", permission: "sync-clients.access" },
        { title: t("menu.mikrotik_sync.re_sync.title"), url: "/re-sync", permission: "client-sync.access" },
      ],
    },
    {
      id: 30,
      title: t("menu.role_permission.title"),
      url: "#",
      icon: ShieldCheck,
      permissions: ["roles.access", "permissions.access"],
      items: [
        { title: t("menu.role_permission.roles.title"), url: "/roles", permission: "roles.access" },
        { title: t("menu.role_permission.permissions.title"), url: "/permissions", permission: "permissions.access" },
      ],
    },
    {
      id: 31,
      title: t("menu.settings.title"),
      url: "#",
      icon: Settings,
      permissions: ["company-settings.access"],
      items: [
        { title: t("menu.settings.general.title"), url: "/settings/general", permission: "company-settings.access" },
        { title: t("menu.settings.sms.title"), url: "/settings/sms", permission: "company-settings.access" },
        { title: t("menu.settings.voice_call.title"), url: "/settings/voice-call", permission: "company-settings.access" },
        { title: t("menu.settings.map.title"), url: "/settings/map", permission: "company-settings.access" },
        { title: t("menu.settings.payments.title"), url: "/settings/payments", permission: "company-settings.access" },
        { title: t("menu.settings.telegram.title"), url: "/settings/telegram", permission: "company-settings.access" },
      ],
    },
  ];
}

// ─── Hook ─────────────────────────────────────────────────────────────

export function useMenuItems(): NavMenuItem[] {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  return useMemo(() => {
    const menuConfig = buildMenuConfig(t);
    return menuConfig.reduce<NavMenuItem[]>((acc, config) => {
      const hasAccess = config.permissions.some((p) => hasPermission(p));
      if (!hasAccess) return acc;

      if (!config.items) {
        acc.push({
          id: config.id,
          title: config.title,
          url: config.url,
          icon: config.icon,
        });
        return acc;
      }

      const visibleSubItems = config.items.filter((sub) =>
        hasPermission(sub.permission)
      );
      if (visibleSubItems.length === 0) return acc;

      acc.push({
        id: config.id,
        title: config.title,
        url: config.url,
        icon: config.icon,
        items: visibleSubItems.map(({ title, url }) => ({ title, url })),
      });
      return acc;
    }, []);
  }, [t, hasPermission]);
}

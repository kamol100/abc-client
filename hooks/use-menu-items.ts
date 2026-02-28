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

const MENU_CONFIG: MenuItemConfig[] = [
  {
    id: 1,
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    permissions: ["dashboard.access", "client.dashboard"],
  },
  {
    id: 2,
    title: "Clients",
    url: "/clients",
    icon: Users,
    permissions: ["clients.access"],
  },
  {
    id: 3,
    title: "Reports",
    url: "#",
    icon: FileBarChart,
    permissions: ["reports.access"],
    items: [
      { title: "Income & Expense", url: "/reports/income-expense", permission: "reports.access" },
      { title: "Funds", url: "/reports/funds", permission: "funds.access" },
      { title: "Invoices", url: "/reports/invoices", permission: "invoices.access" },
      { title: "Payments", url: "/reports/payments", permission: "payments.access" },
      { title: "Expenses", url: "/reports/expenses", permission: "expenses.access" },
      { title: "Product In", url: "/reports/product-in", permission: "products-in.report" },
      { title: "Product Out", url: "/reports/product-out", permission: "products-in.report" },
    ],
  },
  {
    id: 9,
    title: "Tickets",
    url: "/client/tickets",
    icon: Headset,
    permissions: ["client.tickets"],
  },
  {
    id: 222,
    title: "Invoice",
    url: "/client/invoices",
    icon: FileText,
    permissions: ["client.invoices"],
  },
  {
    id: 2222,
    title: "Payment Due",
    url: "/client/pay",
    icon: Receipt,
    permissions: ["client.invoices"],
  },
  {
    id: 4,
    title: "Payments",
    url: "/client/payments",
    icon: Banknote,
    permissions: ["client.invoices"],
  },
  {
    id: 25,
    title: "Maps",
    url: "#",
    icon: Map,
    permissions: ["clients.map"],
    items: [
      { title: "Client Maps", url: "/client-maps", permission: "clients.map" },
      { title: "Tj Box Maps", url: "/tj-box-maps", permission: "tj-boxes.map" },
      { title: "Tj Boxes", url: "/tj-boxes", permission: "tj-boxes.access" },
    ],
  },
  {
    id: 5,
    title: "Invoice",
    url: "#",
    icon: FileText,
    permissions: ["invoices.access", "invoice-types.access"],
    items: [
      { title: "Invoice", url: "/invoices", permission: "invoices.access" },
      { title: "Invoice Type", url: "/invoice-types", permission: "invoice-types.access" },
    ],
  },
  {
    id: 6,
    title: "Payments",
    url: "#",
    icon: Banknote,
    permissions: ["payments.access"],
    items: [
      { title: "Payments", url: "/payments", permission: "products.access" },
    ],
  },
  {
    id: 7,
    title: "Products",
    url: "#",
    icon: PackageOpen,
    permissions: ["products.access", "product-categories.access", "products-in.report", "unit-types.access"],
    items: [
      { title: "Products", url: "/products", permission: "products.access" },
      { title: "Products Reports", url: "/products/reports", permission: "products-in.report" },
      { title: "Products Category", url: "/product-categories", permission: "product-categories.access" },
      { title: "Unit Types", url: "/unit-types", permission: "unit-types.access" },
    ],
  },
  {
    id: 8,
    title: "Expense",
    url: "#",
    icon: CircleDollarSign,
    permissions: ["expenses.access", "expense-types.access"],
    items: [
      { title: "Expenses", url: "/expenses", permission: "expenses.access" },
      { title: "Expense Category", url: "/expense-categories", permission: "expense-categories.access" },
      { title: "Expense Types", url: "/expense-types", permission: "expense-types.access" },
    ],
  },
  {
    id: 26,
    title: "Support / Tickets",
    url: "#",
    icon: LifeBuoy,
    permissions: ["tickets.access", "subjects.access", "tags.access"],
    items: [
      { title: "Tickets", url: "/tickets", permission: "tickets.access" },
      { title: "Subjects", url: "/subjects", permission: "subjects.access" },
      { title: "Tags", url: "/tags", permission: "tags.access" },
    ],
  },
  {
    id: 10,
    title: "Resellers",
    url: "/resellers",
    icon: UserCheck,
    permissions: ["resellers.access"],
  },
  {
    id: 10332,
    title: "Communication",
    url: "#",
    icon: Radio,
    permissions: ["communication-gateways.access"],
    items: [
      { title: "Gateways", url: "/communication-gateways", permission: "communication-gateways.access" },
      { title: "Queue", url: "/communication-queue", permission: "communication-queue.access" },
      { title: "Logs", url: "/communication-logs", permission: "communication-gateways.access" },
    ],
  },
  {
    id: 30,
    title: "SMS",
    url: "#",
    icon: MessageSquare,
    permissions: ["sms-templates.access"],
    items: [
      { title: "SMS Send", url: "/sms-send", permission: "sms-send.access" },
      { title: "SMS Templates", url: "/sms-templates", permission: "sms-templates.access" },
    ],
  },
  {
    id: 11,
    title: "Networks",
    url: "#",
    icon: Network,
    permissions: ["networks.access", "devices.access", "device-types.access"],
    items: [
      { title: "Networks", url: "/networks", permission: "networks.access" },
      { title: "Devices", url: "/devices", permission: "devices.access" },
      { title: "Device Type", url: "/device-types", permission: "device-types.access" },
    ],
  },
  {
    id: 12,
    title: "Mikrotik Commands",
    url: "/mikrotik-commands",
    icon: SquareTerminal,
    permissions: ["mikrotik-command.access"],
  },
  {
    id: 13,
    title: "Activity Logs",
    url: "/activity-logs",
    icon: ScrollText,
    permissions: ["activity-logs.access"],
  },
  {
    id: 1233,
    title: "History",
    url: "/histories",
    icon: History,
    permissions: ["histories.access"],
  },
  {
    id: 14,
    title: "Zones",
    url: "#",
    icon: MapPin,
    permissions: ["zones.access", "sub-zones.access"],
    items: [
      { title: "Zones", url: "/zones", permission: "zones.access" },
      { title: "Sub Zone", url: "/sub-zones", permission: "sub-zones.access" },
    ],
  },
  {
    id: 15,
    title: "Packages",
    url: "#",
    icon: Package,
    permissions: ["packages.access", "resellers.access"],
    items: [
      { title: "Mikrotik Package", url: "/mikrotik-packages", permission: "mikrotik-packages.access" },
      { title: "Client Package", url: "/client-packages", permission: "packages.access" },
      { title: "Reseller Package", url: "/reseller-packages", permission: "resellers.access" },
    ],
  },
  {
    id: 16,
    title: "Vendors",
    url: "/vendors",
    icon: Store,
    permissions: ["vendors.access"],
  },
  {
    id: 17,
    title: "Funds",
    url: "#",
    icon: Landmark,
    permissions: ["funds.access", "fund-transactions.access"],
    items: [
      { title: "Funds", url: "/funds", permission: "funds.access" },
      { title: "Transaction", url: "/fund-transactions", permission: "fund-transactions.access" },
    ],
  },
  {
    id: 18,
    title: "Staffs",
    url: "#",
    icon: UserCog,
    permissions: ["staffs.access", "salaries.access"],
    items: [
      { title: "Staffs", url: "/staffs", permission: "staffs.access" },
      { title: "Salaries", url: "/salaries", permission: "salaries.access" },
    ],
  },
  {
    id: 19,
    title: "Wallets",
    url: "#",
    icon: Wallet,
    permissions: ["wallets.access"],
    items: [
      { title: "My Wallets", url: "/my-wallets", permission: "wallets.access" },
      { title: "Client Wallets", url: "/client-wallets", permission: "wallets.access" },
    ],
  },
  {
    id: 20,
    title: "Users",
    url: "/users",
    icon: Users,
    permissions: ["users.access"],
  },
  {
    id: 21,
    title: "Companies",
    url: "/companies",
    icon: Building2,
    permissions: ["companies.access"],
  },
  {
    id: 22,
    title: "Mikrotik Sync",
    url: "#",
    icon: RefreshCw,
    permissions: ["sync-clients.access", "client-sync.access"],
    items: [
      { title: "Import", url: "/import-client", permission: "sync-clients.access" },
      { title: "Re-Sync", url: "/client-sync", permission: "client-sync.access" },
    ],
  },
  {
    id: 23,
    title: "Role & Permission",
    url: "#",
    icon: ShieldCheck,
    permissions: ["roles.access", "permissions.access"],
    items: [
      { title: "Roles", url: "/roles", permission: "roles.access" },
      { title: "Permissions", url: "/permissions", permission: "permissions.access" },
    ],
  },
  {
    id: 24,
    title: "Settings",
    url: "/settings",
    icon: Settings,
    permissions: ["company-settings.access"],
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────

export function useMenuItems(): NavMenuItem[] {
  const { hasPermission } = usePermissions();

  return useMemo(() => {
    return MENU_CONFIG.reduce<NavMenuItem[]>((acc, config) => {
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
  }, [hasPermission]);
}

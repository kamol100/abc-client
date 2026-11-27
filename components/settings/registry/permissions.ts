/**
 * WHO may open and change settings.
 *
 * One permission per settings page (its menu item) and, on a page with several
 * blocks, one per block. Saving also needs "company-settings.edit", the route
 * permission. A setting that is on no settings page (a list's filter position,
 * the theme) needs only the route permission.
 *
 * The API checks the same names (isp-backend app/Services/Settings/SettingPermissions.php).
 */

type HasPermission = (permission: string) => boolean;

export const SETTINGS_PERMISSIONS = {
  general: "company-settings.general",
  generalIdPrefixes: "company-settings.general.id-prefixes",
  generalClients: "company-settings.general.clients",
  generalBooks: "company-settings.general.books",
  dashboard: "company-settings.dashboard",
  sms: "company-settings.sms",
  smsClientEvents: "company-settings.sms.client-events",
  smsInvoices: "company-settings.sms.invoices",
  smsDueReminders: "company-settings.sms.due-reminders",
  map: "company-settings.map",
  monitoring: "company-settings.monitoring",
  olt: "company-settings.olt",
  notifications: "company-settings.notifications",
  invoicePrint: "company-settings.invoice-print",
  /** The sidebar menu page keeps the permission of its own API route. */
  menuLayout: "menu-layout.edit",
} as const;

/** Needed to read the settings at all; every settings page asks for it too. */
export const SETTINGS_ACCESS_PERMISSION = "company-settings.access";

/** The block of one notification category, e.g. "platform_support" → "…notifications.platform-support". */
export function notificationCategoryPermission(category: string): string {
  return `${SETTINGS_PERMISSIONS.notifications}.${category.replace(/_/g, "-")}`;
}

/** The settings pages in menu order: where each one is and what opens it. */
export const SETTINGS_PAGES = [
  { url: "/settings/general", title: "menu.settings.general.title", permission: SETTINGS_PERMISSIONS.general },
  { url: "/settings/dashboard", title: "menu.settings.dashboard.title", permission: SETTINGS_PERMISSIONS.dashboard },
  { url: "/settings/sms", title: "menu.settings.sms.title", permission: SETTINGS_PERMISSIONS.sms },
  { url: "/settings/map", title: "menu.settings.map.title", permission: SETTINGS_PERMISSIONS.map },
  { url: "/settings/monitoring", title: "menu.settings.monitoring.title", permission: SETTINGS_PERMISSIONS.monitoring },
  { url: "/settings/olt", title: "menu.settings.olt.title", permission: SETTINGS_PERMISSIONS.olt },
  { url: "/settings/notifications", title: "menu.settings.notifications.title", permission: SETTINGS_PERMISSIONS.notifications },
  { url: "/settings/invoice-print", title: "menu.settings.invoice_print.title", permission: SETTINGS_PERMISSIONS.invoicePrint },
  { url: "/settings/menu", title: "menu.settings.menu_layout.title", permission: SETTINGS_PERMISSIONS.menuLayout },
] as const;

/** The sidebar menu page has its own API; the others read the company settings. */
function pageIsOpen(page: (typeof SETTINGS_PAGES)[number], hasPermission: HasPermission): boolean {
  if (!hasPermission(page.permission)) return false;
  return page.permission === SETTINGS_PERMISSIONS.menuLayout || hasPermission(SETTINGS_ACCESS_PERMISSION);
}

/** May the user open this settings page? */
export function canOpenSettingsPage(permission: string, hasPermission: HasPermission): boolean {
  const page = SETTINGS_PAGES.find((candidate) => candidate.permission === permission);
  return page ? pageIsOpen(page, hasPermission) : false;
}

/** The first settings page the user may open, for a plain "Settings" link. Null when there is none. */
export function firstSettingsPath(hasPermission: HasPermission): string | null {
  return SETTINGS_PAGES.find((page) => pageIsOpen(page, hasPermission))?.url ?? null;
}

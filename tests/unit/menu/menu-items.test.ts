import { describe, expect, it } from "vitest";
import { buildMenuConfig, selectMenuItems, type MenuAccess, type NavMenuItem } from "@/hooks/use-menu-items";

const menu = buildMenuConfig((key) => key);

function access(permissions: string[] | true, extra: Partial<MenuAccess> = {}): MenuAccess {
  const allow = permissions === true ? null : new Set(permissions);
  return {
    hasPermission: (permission) => allow === null || allow.has(permission),
    isReseller: false,
    ...extra,
  };
}

function urls(items: NavMenuItem[]): string[] {
  return items.flatMap((item) => (item.items ? item.items.map((sub) => sub.url) : [item.url]));
}

function group(items: NavMenuItem[], id: number): NavMenuItem {
  const match = items.find((item) => item.id === id);
  if (!match) throw new Error(`missing menu ${id}`);
  return match;
}

describe("admin menu order", () => {
  it("follows the admin sidebar order and keeps every current link", () => {
    const items = selectMenuItems(menu, access(true));

    expect(items.map((item) => item.url)).toEqual([
      "/dashboard",
      "/clients",
      "#",
      "/referrals",
      "#",
      "/platform-support-admin",
      "#",
      "#",
      "#",
      "/resellers",
      "#",
      "#",
      "#",
      "#",
      "#",
      "#",
      "#",
      "#",
      "/vendors",
      "#",
      "/activity-logs",
      "/histories",
      "/users",
      "#",
      "/payment-gateways",
      "/subscription",
      "/companies",
      "/demo-requests",
      "/archived-clients",
      "#",
      "/platform-support",
      "#",
    ]);
    expect(urls(items)).toEqual([
      "/dashboard",
      "/clients",
      "/tickets",
      "/subjects",
      "/tags",
      "/referrals",
      "/platform-referrals",
      "/platform-referral-sellers",
      "/platform-support-admin?kind=issue",
      "/platform-support-admin?kind=chat",
      "/help-management",
      "/help-management/categories",
      "/invoices",
      "/payments",
      "/invoice-types",
      "/expenses",
      "/expense-types",
      "/resellers",
      "/agents",
      "/agent-transactions",
      "/reports/reseller-clients",
      "/networks",
      "/noc",
      "/mikrotik-sync",
      "/mikrotik-commands",
      "/mikrotik-packages",
      "/client-packages",
      "/reseller-packages",
      "/devices",
      "/device-types",
      "/olts",
      "/onus",
      "/zones",
      "/sub-zones",
      "/client-maps",
      "/tj-box-maps",
      "/tj-boxes",
      "/sms-send",
      "/sms-templates",
      "/telegram",
      "/communication-queue",
      "/communication-logs",
      "/funds",
      "/fund-transactions",
      "/my-wallets",
      "/client-wallets",
      "/reports/income-expense",
      "/reports/funds",
      "/reports/invoices",
      "/reports/payments",
      "/reports/expenses",
      "/reports/product-in",
      "/reports/product-out",
      "/reports/new-clients",
      "/reports/btrc",
      "/products",
      "/products/reports",
      "/product-categories",
      "/unit-types",
      "/vendors",
      "/staffs",
      "/salaries",
      "/activity-logs",
      "/histories",
      "/users",
      "/roles",
      "/permissions",
      "/payment-gateways",
      "/subscription",
      "/companies",
      "/demo-requests",
      "/archived-clients",
      "/company-subscriptions",
      "/subscription-plans",
      "/subscription-features",
      "/platform-support?kind=issue",
      "/platform-support?kind=chat",
      "/help",
      "/settings/general",
      "/settings/dashboard",
      "/settings/sms",
      "/settings/map",
      "/settings/monitoring",
      "/settings/olt",
      "/settings/notifications",
      "/settings/invoice-print",
      "/settings/menu",
    ]);
    expect(urls(items).some((url) => url.startsWith("/client/"))).toBe(false);
  });
});

describe("admin menu permissions", () => {
  it("shows only the Help management pages the user can access", () => {
    const articles = selectMenuItems(menu, access(["platform-help-admin.articles.access"]));
    const categories = selectMenuItems(menu, access(["platform-help-admin.categories.access"]));
    expect(group(articles, 40).items?.map((item) => item.url)).toEqual(["/help-management"]);
    expect(group(categories, 40).items?.map((item) => item.url)).toEqual(["/help-management/categories"]);
    expect(selectMenuItems(menu, access(["platform-support.access"])).some((item) => item.id === 40)).toBe(false);
  });

  it("shows a network child only for its own permission", () => {
    const items = selectMenuItems(menu, access(["networks.access", "mikrotik-packages.access"]));

    expect(urls(items)).toEqual(["/networks", "/subscription"]);
  });

  it("keeps mikrotik package behind the old packages gate", () => {
    const hidden = selectMenuItems(menu, access(["mikrotik-packages.access"]));
    const visible = selectMenuItems(menu, access(["packages.access", "mikrotik-packages.access"]));

    expect(urls(hidden)).toEqual(["/subscription"]);
    expect(urls(visible)).toEqual(["/mikrotik-packages", "/client-packages", "/subscription"]);
  });

  it("shows mikrotik sync for its own permission", () => {
    expect(urls(selectMenuItems(menu, access(["mikrotik-sync.access"])))).toEqual([
      "/mikrotik-sync",
      "/subscription",
    ]);
  });

  it("shows noc only with monitoring access", () => {
    expect(urls(selectMenuItems(menu, access(["monitoring.summary"])))).toEqual(["/noc", "/subscription"]);
  });

  it("shows send sms inside communication without the other communication links", () => {
    expect(urls(selectMenuItems(menu, access(["sms-send.access"])))).toEqual(["/sms-send", "/subscription"]);
  });

  it("shows reseller clients under the reseller menu", () => {
    const items = selectMenuItems(menu, access(["resellers.clients.report"]));
    const resellers = group(items, 14);

    expect(resellers.items?.map((sub) => sub.url)).toEqual(["/reports/reseller-clients"]);
    expect(urls(items)).not.toContain("/reports/income-expense");
  });

  it("does not open a report link from an unrelated permission", () => {
    expect(urls(selectMenuItems(menu, access(["funds.access"])))).toEqual(["/funds", "/subscription"]);
    expect(urls(selectMenuItems(menu, access(["reports.access"])))).toEqual([
      "/reports/income-expense",
      "/reports/new-clients",
      "/reports/btrc",
      "/subscription",
    ]);
  });

  it("hides the tenant subscription from a reseller and still applies other permissions", () => {
    const items = selectMenuItems(menu, access(true, { isReseller: true }));

    expect(urls(items)).not.toContain("/subscription");
    expect(urls(items)).toContain("/company-subscriptions");
  });
});

describe("admin menu feature locks", () => {
  it("locks network links without revealing packages or noc", () => {
    const items = selectMenuItems(menu, access([], { subscriptionState: "expired", disabledFeatures: ["network"] }));
    const network = group(items, 17);

    expect(network.disabled).toBe(true);
    expect(network.items?.map((sub) => sub.url)).toEqual([
      "/networks",
      "/mikrotik-sync",
      "/mikrotik-commands",
      "/devices",
      "/device-types",
      "/olts",
      "/onus",
    ]);
    expect(network.items?.every((sub) => sub.disabled)).toBe(true);
  });

  it("locks noc on the olts feature without locking the rest of network", () => {
    const items = selectMenuItems(
      menu,
      access(["networks.access"], { subscriptionState: "expired", disabledFeatures: ["olts"] }),
    );
    const network = group(items, 17);

    expect(network.disabled).toBe(false);
    expect(network.items?.map((sub) => [sub.url, sub.disabled])).toEqual([
      ["/networks", false],
      ["/noc", true],
    ]);
  });

  it("locks every communication link, including sms, when sms is disabled", () => {
    const items = selectMenuItems(menu, access([], { subscriptionState: "expired", disabledFeatures: ["sms"] }));
    const communication = group(items, 15);

    expect(communication.disabled).toBe(true);
    expect(communication.items?.map((sub) => sub.url)).toEqual([
      "/sms-send",
      "/sms-templates",
      "/telegram",
      "/communication-queue",
      "/communication-logs",
    ]);
    expect(communication.items?.every((sub) => sub.disabled)).toBe(true);
  });

  it("shows platform support without tickets, notifications, or the paid support feature", () => {
    const items = selectMenuItems(menu, access(["platform-support.access"]));

    expect(urls(items)).toEqual([
      "/subscription",
      "/platform-support?kind=issue",
      "/platform-support?kind=chat",
      "/help",
    ]);
    expect(group(items, 38).disabled).toBe(false);
    expect(urls(items)).not.toContain("/tickets");
    expect(urls(items)).not.toContain("/platform-support-admin?kind=issue");
  });

  it("shows the platform inbox only with the admin access permission", () => {
    const hidden = selectMenuItems(menu, access(["platform-support.access", "platform-support-admin.reply"]));
    expect(urls(hidden)).not.toContain("/platform-support-admin?kind=issue");

    const visible = selectMenuItems(menu, access(["platform-support-admin.access"]));
    expect(urls(visible)).toEqual([
      "/platform-support-admin?kind=issue",
      "/platform-support-admin?kind=chat",
      "/subscription",
    ]);
    expect(group(visible, 39).disabled).toBe(false);
  });
});

describe("independent referral sidebar", () => {
  it("shows only My referrals even when support and other permissions exist", () => {
    const items = selectMenuItems(menu, access(true, { isIndependentReferral: true }));
    expect(urls(items)).toEqual(["/referrals"]);
  });
  it("keeps the referral-only account's history accessible when subscription features are locked", () => {
    const items = selectMenuItems(menu, access(["referrals.access", "platform-support.access"], {
      isIndependentReferral: true, subscriptionState: "expired", disabledFeatures: ["core"],
    }));
    expect(urls(items)).toEqual(["/referrals"]);
    expect(items[0].disabled).toBe(false);
  });
  it("preserves subscription and support for other tenant and reseller sellers", () => {
    for (const isReseller of [false, true]) {
      const items = selectMenuItems(menu, access(["referrals.access", "platform-support.access"], { isReseller }));
      if (isReseller) expect(urls(items)).not.toContain("/subscription");
      else expect(urls(items)).toContain("/subscription");
      expect(urls(items)).toContain("/platform-support?kind=issue");
      expect(urls(items)).toContain("/referrals");
    }
  });
  it("does not invent referral permission from a profile flag", () => {
    expect(selectMenuItems(menu, access([], { isIndependentReferral: true }))).toEqual([]);
  });
});

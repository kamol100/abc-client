// Data only, no hooks: the route (a server component) imports this through the registry.
import type { ComponentType } from "react";
import type { ModuleContent, ModuleId } from "@/components/marketing/modules/module-types";
import {
  FinanceSample,
  InventorySample,
  PortalSample,
  ReportsSample,
  ResellersSample,
  SupportSample,
} from "@/components/marketing/modules/samples-b";

// Names map to keys: highlights.<h>, sections.<s>.{title,summary,items.<i>}, specs.<x>.{label,value}, all under module_pages.<id>.
function build(
  id: ModuleId,
  highlights: string[],
  sections: Record<string, string[]>,
  specs: string[],
  related: ModuleId[],
  Sample: ComponentType,
): ModuleContent {
  const p = `module_pages.${id}`;
  return {
    id,
    highlightKeys: highlights.map((h) => `${p}.highlights.${h}`),
    sections: Object.entries(sections).map(([s, items]) => ({
      titleKey: `${p}.sections.${s}.title`,
      summaryKey: `${p}.sections.${s}.summary`,
      itemKeys: items.map((i) => `${p}.sections.${s}.items.${i}`),
    })),
    specs: specs.map((x) => ({ labelKey: `${p}.specs.${x}.label`, valueKey: `${p}.specs.${x}.value` })),
    Sample,
    related,
  };
}

export const MODULES_B: ModuleContent[] = [
  // Section order follows the template's rotation: rows (4 to 6 items), cells (3 or 6), list (4 or 6).
  build(
    "support",
    ["assign", "priority", "status", "portal"],
    {
      open: ["client", "tags", "priority", "olt"],
      customer: ["open", "reply", "status"],
      work: ["assign", "status", "thread", "noc"],
    },
    ["statuses", "priority", "fields", "assignment", "opened_by", "shortcuts", "linked", "access", "languages"],
    ["subscribers", "portal", "noc"],
    SupportSample,
  ),
  build(
    "resellers",
    ["billing", "recharge", "limits", "switch"],
    {
      setup: ["billing", "overdue", "auto", "packages"],
      recharge: ["balance", "short", "wallet"],
      agents: ["commission", "balance", "link", "switch", "permissions", "report"],
    },
    ["billing", "cost", "methods", "limits", "commission", "packages", "agents", "reports", "access"],
    ["billing", "subscribers", "reports"],
    ResellersSample,
  ),
  build(
    "finance",
    ["funds", "moves", "approval", "salary"],
    {
      funds: ["deposit", "transfer", "withdraw", "report"],
      expenses: ["fields", "approve", "stock"],
      payroll: ["type", "lines", "fund", "staff"],
    },
    ["funds", "moves", "expense_fields", "expense_status", "salary_type", "salary_lines", "paid_from", "staff", "reports"],
    ["billing", "reports", "inventory"],
    FinanceSample,
  ),
  build(
    "inventory",
    ["serials", "voucher", "invoice", "onu"],
    {
      products: ["category", "unit", "vat", "serial"],
      stock_in: ["purchase", "vendor", "lines"],
      stock_out: ["receiver", "serials", "line", "invoice"],
    },
    ["product", "stock_in", "stock_out", "lines", "serials", "invoice", "onu", "reports"],
    ["olt", "finance", "billing"],
    InventorySample,
  ),
  build(
    "reports",
    ["btrc", "income", "dues", "widgets"],
    {
      btrc: ["scope", "filters", "reseller", "columns"],
      money: ["income", "fund", "invoice", "expense", "stock", "reseller"],
      dashboard: ["chart", "top", "zone", "hide"],
    },
    ["format", "btrc", "filters", "status", "client_columns", "reseller_columns", "finance", "other", "dashboard"],
    ["billing", "finance", "resellers"],
    ReportsSample,
  ),
  build(
    "portal",
    ["status", "expiry", "bkash", "quick"],
    {
      dashboard: ["account", "onu", "expiry", "package", "tickets"],
      invoices: ["print", "bkash", "history"],
      quick: ["lookup", "pay", "links", "short"],
    },
    ["login", "dashboard", "invoices", "payment", "quick", "links", "tickets", "install", "languages", "theme"],
    ["billing", "support", "messaging"],
    PortalSample,
  ),
];

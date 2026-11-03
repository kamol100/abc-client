import type { ComponentType } from "react";

// Ids match the module blocks on /features and the nav's module links.
export const MODULE_IDS = [
  "subscribers", "billing", "mikrotik", "olt", "noc", "messaging",
  "support", "resellers", "finance", "inventory", "reports", "portal",
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

// Every string is an i18n key under `module_pages.<id>.*`.
export type ModuleContent = {
  id: ModuleId;
  /** Four short check-list lines under the page title, like a MikroTik product page. */
  highlightKeys: string[];
  /** Capability groups: a heading, an optional one-line summary, and terse items. */
  sections: { titleKey: string; summaryKey?: string; itemKeys: string[] }[];
  /** Spec table rows, label and value (a measurement, a limit, a protocol, a list). */
  specs: { labelKey: string; valueKey: string }[];
  /** The interface built at full fidelity, shown in the page's first-screen slot. */
  Sample?: ComponentType;
  related: ModuleId[];
};

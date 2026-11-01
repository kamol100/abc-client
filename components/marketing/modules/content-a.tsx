// Data only, no hooks: the route (a server component) imports this through the registry.
// The Samples live in a "use client" file so they can call useTranslation.
import type { ComponentType } from "react";
import type { ModuleContent, ModuleId } from "@/components/marketing/modules/module-types";
import {
  BillingSample,
  MessagingSample,
  MikrotikSample,
  NocSample,
  OltSample,
  SubscribersSample,
} from "@/components/marketing/modules/samples-a";

// Keys follow module_pages.<id>.{highlights.N, sections.N.{title,summary,items.M}, specs.N.{label,value}}.
function build(id: ModuleId, itemCounts: number[], specCount: number, Sample: ComponentType, related: ModuleId[]): ModuleContent {
  const p = `module_pages.${id}`;
  const n = (count: number) => Array.from({ length: count }, (_, i) => i);
  return {
    id,
    highlightKeys: n(4).map((i) => `${p}.highlights.${i}`),
    sections: itemCounts.map((count, s) => ({
      titleKey: `${p}.sections.${s}.title`,
      summaryKey: `${p}.sections.${s}.summary`,
      itemKeys: n(count).map((i) => `${p}.sections.${s}.items.${i}`),
    })),
    specs: n(specCount).map((i) => ({ labelKey: `${p}.specs.${i}.label`, valueKey: `${p}.specs.${i}.value` })),
    Sample,
    related,
  };
}

export const MODULES_A: ModuleContent[] = [
  build("subscribers", [4, 9, 4], 8, SubscribersSample, ["billing", "mikrotik", "portal", "resellers"]),
  build("billing", [4, 6, 4], 7, BillingSample, ["subscribers", "finance", "portal", "reports"]),
  build("mikrotik", [4, 3, 4], 6, MikrotikSample, ["subscribers", "olt", "noc", "billing"]),
  build("olt", [6, 6, 4], 7, OltSample, ["noc", "mikrotik", "subscribers", "support"]),
  build("noc", [4, 3, 6], 6, NocSample, ["olt", "support", "messaging", "mikrotik"]),
  build("messaging", [4, 3, 4], 7, MessagingSample, ["billing", "subscribers", "noc", "support"]),
];

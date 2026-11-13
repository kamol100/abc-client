import type { HelpArticlePolicy } from "@/content/help/catalog";

import type { HelpTopic } from "@/types/help-topic";

const TOPICS: Partial<Record<string, HelpTopic>> = {
    clients: "clients", zones: "clients", subzones: "clients", packages: "clients",
    invoices: "billing", invoicetypes: "billing", payments: "billing", expenses: "billing",
    expensetypes: "billing", funds: "billing", fundtransactions: "billing", wallets: "billing", paymentgateways: "billing",
    networks: "network", mikrotik: "network", devices: "network", devicetypes: "network", olts: "network", onus: "network", noc: "network", tjboxes: "network",
    resellers: "resellers", agents: "resellers", agenttransactions: "resellers",
    support: "getting_started", dashboard: "getting_started",
    staffs: "settings", staff: "settings", roles: "settings", permissions: "settings", company: "settings",
};

export function helpTopicFor(article: Pick<HelpArticlePolicy, "id" | "audience">): HelpTopic {
    if (article.audience === "platform") return "platform";
    return TOPICS[article.id.split(".")[0]] ?? "operations";
}

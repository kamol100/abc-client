export const HELP_LOCALES = ["en", "bn"] as const;

export type HelpLocale = (typeof HELP_LOCALES)[number];

export type HelpAudience = "staff" | "platform";

export type HelpPublication = "published" | "draft";

export type HelpKind = "guide" | "faq";

/**
 * Permission rules live here and are shared by every language.
 * Translators edit the Markdown front matter, not this file.
 */
export interface HelpArticlePolicy {
  id: string;
  slug: string;
  kind: HelpKind;
  audience: HelpAudience;
  requiredAll: readonly string[];
  requiredAny: readonly string[];
  feature?: string;
  baseline: boolean;
  routePatterns: readonly string[];
  relatedIds: readonly string[];
  sortOrder: number;
  sourceRevision: string;
  publication: HelpPublication;
  developmentEnglishFallback?: boolean;
  videos?: Partial<Record<HelpLocale, string>>;
  file: string;
}

const revision = "1";

export const HELP_ARTICLES: readonly HelpArticlePolicy[] = [
  {
    id: "support.getting-started",
    slug: "support/getting-started",
    kind: "guide",
    audience: "staff",
    requiredAll: [],
    requiredAny: [],
    baseline: true,
    routePatterns: ["/dashboard"],
    relatedIds: ["support.contact"],
    sortOrder: 10,
    sourceRevision: revision,
    publication: "published",
    file: "support/getting-started.md",
  },
  {
    id: "support.contact",
    slug: "support/contact",
    kind: "guide",
    audience: "staff",
    requiredAll: [],
    requiredAny: [],
    baseline: true,
    routePatterns: [],
    relatedIds: ["support.faq.contact", "support.create-issue"],
    sortOrder: 20,
    sourceRevision: revision,
    publication: "published",
    file: "support/contact.md",
  },
  {
    id: "support.faq.contact",
    slug: "support/faq-contact",
    kind: "faq",
    audience: "staff",
    requiredAll: [],
    requiredAny: [],
    baseline: true,
    routePatterns: [],
    relatedIds: ["support.contact"],
    sortOrder: 30,
    sourceRevision: revision,
    publication: "published",
    file: "support/faq-contact.md",
  },
  {
    id: "support.create-issue",
    slug: "support/create-issue",
    kind: "guide",
    audience: "staff",
    requiredAll: ["platform-support.create"],
    requiredAny: [],
    baseline: true,
    routePatterns: ["/platform-support"],
    relatedIds: ["support.chat"],
    sortOrder: 40,
    sourceRevision: revision,
    publication: "published",
    file: "support/create-issue.md",
  },
  {
    id: "support.chat",
    slug: "support/chat",
    kind: "guide",
    audience: "staff",
    requiredAll: ["platform-support.create", "platform-support.reply"],
    requiredAny: [],
    baseline: true,
    routePatterns: ["/platform-support/chats/:id"],
    relatedIds: ["support.images", "support.convert-chat"],
    sortOrder: 50,
    sourceRevision: revision,
    publication: "published",
    file: "support/chat.md",
  },
  {
    id: "support.images",
    slug: "support/images",
    kind: "guide",
    audience: "staff",
    requiredAll: ["platform-support.upload", "platform-support.reply"],
    requiredAny: [],
    baseline: true,
    routePatterns: ["/platform-support/issues/:id", "/platform-support/chats/:id"],
    relatedIds: ["support.chat"],
    sortOrder: 60,
    sourceRevision: revision,
    publication: "published",
    file: "support/images.md",
  },
  {
    id: "support.convert-chat",
    slug: "support/convert-chat",
    kind: "guide",
    audience: "staff",
    requiredAll: ["platform-support.convert"],
    requiredAny: [],
    baseline: true,
    routePatterns: ["/platform-support/chats/:id"],
    relatedIds: ["support.chat"],
    sortOrder: 70,
    sourceRevision: revision,
    publication: "published",
    file: "support/convert-chat.md",
  },
  {
    id: "clients.overview",
    slug: "clients/overview",
    kind: "guide",
    audience: "staff",
    requiredAll: ["clients.access"],
    requiredAny: [],
    feature: "clients",
    baseline: false,
    routePatterns: ["/clients", "/clients/view/:id"],
    relatedIds: ["clients.create"],
    sortOrder: 80,
    sourceRevision: revision,
    publication: "published",
    file: "clients/overview.md",
  },
  {
    id: "clients.create",
    slug: "clients/create",
    kind: "guide",
    audience: "staff",
    requiredAll: ["clients.create"],
    requiredAny: [],
    feature: "clients",
    baseline: false,
    routePatterns: ["/clients/create"],
    relatedIds: ["clients.faq.create", "clients.overview"],
    sortOrder: 90,
    sourceRevision: revision,
    publication: "published",
    file: "clients/create.md",
  },
  {
    id: "clients.faq.create",
    slug: "clients/faq-create",
    kind: "faq",
    audience: "staff",
    requiredAll: ["clients.create"],
    requiredAny: [],
    feature: "clients",
    baseline: false,
    routePatterns: [],
    relatedIds: ["clients.create"],
    sortOrder: 100,
    sourceRevision: revision,
    publication: "published",
    file: "clients/faq-create.md",
  },
  {
    id: "invoices.overview",
    slug: "invoices/overview",
    kind: "guide",
    audience: "staff",
    requiredAll: ["invoices.access"],
    requiredAny: [],
    feature: "billing",
    baseline: false,
    routePatterns: ["/invoices", "/invoices/client/:id"],
    relatedIds: ["invoices.faq.list"],
    sortOrder: 110,
    sourceRevision: revision,
    publication: "published",
    file: "invoices/overview.md",
  },
  {
    id: "invoices.faq.list",
    slug: "invoices/faq-list",
    kind: "faq",
    audience: "staff",
    requiredAll: ["invoices.access"],
    requiredAny: [],
    feature: "billing",
    baseline: false,
    routePatterns: [],
    relatedIds: ["invoices.overview"],
    sortOrder: 120,
    sourceRevision: revision,
    publication: "published",
    file: "invoices/faq-list.md",
  },
];

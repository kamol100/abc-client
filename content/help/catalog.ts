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

const HELP_CORE_ARTICLES: readonly HelpArticlePolicy[] = [
  {
    id: "support.getting-started",
    slug: "support/getting-started",
    kind: "guide",
    audience: "staff",
    requiredAll: [],
    requiredAny: [],
    baseline: true,
    routePatterns: ["/dashboard", "/subscription", "/help"],
    relatedIds: ["support.contact"],
    sortOrder: 10,
    sourceRevision: "2",
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

// help-features:start
const HELP_FEATURE_ARTICLES: readonly HelpArticlePolicy[] = [
  {
    "id": "dashboard.overview",
    "slug": "dashboard/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "dashboard.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/dashboard"
    ],
    "relatedIds": [
      "dashboard.overview.faq"
    ],
    "sortOrder": 200,
    "sourceRevision": "1",
    "publication": "published",
    "file": "dashboard/overview.md",
    "feature": "core"
  },
  {
    "id": "dashboard.overview.faq",
    "slug": "dashboard/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "dashboard.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "dashboard.overview"
    ],
    "sortOrder": 210,
    "sourceRevision": "1",
    "publication": "published",
    "file": "dashboard/overview-faq.md",
    "feature": "core"
  },
  {
    "id": "clients.edit",
    "slug": "clients/edit",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "clients.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/clients/edit/:id"
    ],
    "relatedIds": [
      "clients.edit.faq"
    ],
    "sortOrder": 220,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/edit.md",
    "feature": "clients"
  },
  {
    "id": "clients.edit.faq",
    "slug": "clients/edit-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "clients.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "clients.edit"
    ],
    "sortOrder": 230,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/edit-faq.md",
    "feature": "clients"
  },
  {
    "id": "clients.archive",
    "slug": "clients/archive",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "archived-clients.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/archived-clients"
    ],
    "relatedIds": [
      "clients.archive.faq"
    ],
    "sortOrder": 240,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/archive.md",
    "feature": "clients"
  },
  {
    "id": "clients.archive.faq",
    "slug": "clients/archive-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "archived-clients.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "clients.archive"
    ],
    "sortOrder": 250,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/archive-faq.md",
    "feature": "clients"
  },
  {
    "id": "clients.restore",
    "slug": "clients/restore",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "archived-clients.restore"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/archived-clients"
    ],
    "relatedIds": [
      "clients.restore.faq"
    ],
    "sortOrder": 260,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/restore.md",
    "feature": "clients"
  },
  {
    "id": "clients.restore.faq",
    "slug": "clients/restore-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "archived-clients.restore"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "clients.restore"
    ],
    "sortOrder": 270,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/restore-faq.md",
    "feature": "clients"
  },
  {
    "id": "clients.archive-delete",
    "slug": "clients/archive-delete",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "archived-clients.delete"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/archived-clients"
    ],
    "relatedIds": [
      "clients.archive-delete.faq"
    ],
    "sortOrder": 280,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/archive-delete.md",
    "feature": "clients"
  },
  {
    "id": "clients.archive-delete.faq",
    "slug": "clients/archive-delete-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "archived-clients.delete"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "clients.archive-delete"
    ],
    "sortOrder": 290,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/archive-delete-faq.md",
    "feature": "clients"
  },
  {
    "id": "clients.maps",
    "slug": "clients/maps",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "clients.map"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/client-maps"
    ],
    "relatedIds": [
      "clients.maps.faq"
    ],
    "sortOrder": 300,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/maps.md",
    "feature": "clients"
  },
  {
    "id": "clients.maps.faq",
    "slug": "clients/maps-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "clients.map"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "clients.maps"
    ],
    "sortOrder": 310,
    "sourceRevision": "1",
    "publication": "published",
    "file": "clients/maps-faq.md",
    "feature": "clients"
  },
  {
    "id": "zones.overview",
    "slug": "zones/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "zones.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/zones"
    ],
    "relatedIds": [
      "zones.overview.faq"
    ],
    "sortOrder": 320,
    "sourceRevision": "1",
    "publication": "published",
    "file": "zones/overview.md",
    "feature": "clients"
  },
  {
    "id": "zones.overview.faq",
    "slug": "zones/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "zones.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "zones.overview"
    ],
    "sortOrder": 330,
    "sourceRevision": "1",
    "publication": "published",
    "file": "zones/overview-faq.md",
    "feature": "clients"
  },
  {
    "id": "zones.create",
    "slug": "zones/create",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "zones.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/zones"
    ],
    "relatedIds": [
      "zones.create.faq"
    ],
    "sortOrder": 340,
    "sourceRevision": "1",
    "publication": "published",
    "file": "zones/create.md",
    "feature": "clients"
  },
  {
    "id": "zones.create.faq",
    "slug": "zones/create-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "zones.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "zones.create"
    ],
    "sortOrder": 350,
    "sourceRevision": "1",
    "publication": "published",
    "file": "zones/create-faq.md",
    "feature": "clients"
  },
  {
    "id": "sub-zones.overview",
    "slug": "subzones/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "sub-zones.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/sub-zones"
    ],
    "relatedIds": [
      "sub-zones.overview.faq"
    ],
    "sortOrder": 360,
    "sourceRevision": "1",
    "publication": "published",
    "file": "subzones/overview.md",
    "feature": "clients"
  },
  {
    "id": "sub-zones.overview.faq",
    "slug": "subzones/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "sub-zones.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "sub-zones.overview"
    ],
    "sortOrder": 370,
    "sourceRevision": "1",
    "publication": "published",
    "file": "subzones/overview-faq.md",
    "feature": "clients"
  },
  {
    "id": "payments.overview",
    "slug": "payments/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "payments.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/payments"
    ],
    "relatedIds": [
      "payments.overview.faq"
    ],
    "sortOrder": 380,
    "sourceRevision": "1",
    "publication": "published",
    "file": "payments/overview.md",
    "feature": "billing"
  },
  {
    "id": "payments.overview.faq",
    "slug": "payments/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "payments.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "payments.overview"
    ],
    "sortOrder": 390,
    "sourceRevision": "1",
    "publication": "published",
    "file": "payments/overview-faq.md",
    "feature": "billing"
  },
  {
    "id": "invoice-types.overview",
    "slug": "invoicetypes/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "invoice-types.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/invoice-types"
    ],
    "relatedIds": [
      "invoice-types.overview.faq"
    ],
    "sortOrder": 400,
    "sourceRevision": "1",
    "publication": "published",
    "file": "invoicetypes/overview.md",
    "feature": "billing"
  },
  {
    "id": "invoice-types.overview.faq",
    "slug": "invoicetypes/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "invoice-types.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "invoice-types.overview"
    ],
    "sortOrder": 410,
    "sourceRevision": "1",
    "publication": "published",
    "file": "invoicetypes/overview-faq.md",
    "feature": "billing"
  },
  {
    "id": "invoices.create",
    "slug": "invoices/create",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "invoices.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/invoices/create"
    ],
    "relatedIds": [
      "invoices.create.faq"
    ],
    "sortOrder": 420,
    "sourceRevision": "1",
    "publication": "published",
    "file": "invoices/create.md",
    "feature": "billing"
  },
  {
    "id": "invoices.create.faq",
    "slug": "invoices/create-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "invoices.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "invoices.create"
    ],
    "sortOrder": 430,
    "sourceRevision": "1",
    "publication": "published",
    "file": "invoices/create-faq.md",
    "feature": "billing"
  },
  {
    "id": "invoices.edit",
    "slug": "invoices/edit",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "invoices.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/invoices/edit/:id"
    ],
    "relatedIds": [
      "invoices.edit.faq"
    ],
    "sortOrder": 440,
    "sourceRevision": "1",
    "publication": "published",
    "file": "invoices/edit.md",
    "feature": "billing"
  },
  {
    "id": "invoices.edit.faq",
    "slug": "invoices/edit-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "invoices.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "invoices.edit"
    ],
    "sortOrder": 450,
    "sourceRevision": "1",
    "publication": "published",
    "file": "invoices/edit-faq.md",
    "feature": "billing"
  },
  {
    "id": "expenses.overview",
    "slug": "expenses/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "expenses.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/expenses"
    ],
    "relatedIds": [
      "expenses.overview.faq"
    ],
    "sortOrder": 460,
    "sourceRevision": "1",
    "publication": "published",
    "file": "expenses/overview.md",
    "feature": "finance"
  },
  {
    "id": "expenses.overview.faq",
    "slug": "expenses/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "expenses.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "expenses.overview"
    ],
    "sortOrder": 470,
    "sourceRevision": "1",
    "publication": "published",
    "file": "expenses/overview-faq.md",
    "feature": "finance"
  },
  {
    "id": "expenses.approve",
    "slug": "expenses/approve",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "expenses.approval"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/expenses"
    ],
    "relatedIds": [
      "expenses.approve.faq"
    ],
    "sortOrder": 480,
    "sourceRevision": "1",
    "publication": "published",
    "file": "expenses/approve.md",
    "feature": "finance"
  },
  {
    "id": "expenses.approve.faq",
    "slug": "expenses/approve-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "expenses.approval"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "expenses.approve"
    ],
    "sortOrder": 490,
    "sourceRevision": "1",
    "publication": "published",
    "file": "expenses/approve-faq.md",
    "feature": "finance"
  },
  {
    "id": "expense-types.overview",
    "slug": "expensetypes/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "expense-types.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/expense-types"
    ],
    "relatedIds": [
      "expense-types.overview.faq"
    ],
    "sortOrder": 500,
    "sourceRevision": "1",
    "publication": "published",
    "file": "expensetypes/overview.md",
    "feature": "finance"
  },
  {
    "id": "expense-types.overview.faq",
    "slug": "expensetypes/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "expense-types.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "expense-types.overview"
    ],
    "sortOrder": 510,
    "sourceRevision": "1",
    "publication": "published",
    "file": "expensetypes/overview-faq.md",
    "feature": "finance"
  },
  {
    "id": "funds.overview",
    "slug": "funds/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "funds.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/funds"
    ],
    "relatedIds": [
      "funds.overview.faq"
    ],
    "sortOrder": 520,
    "sourceRevision": "1",
    "publication": "published",
    "file": "funds/overview.md",
    "feature": "finance"
  },
  {
    "id": "funds.overview.faq",
    "slug": "funds/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "funds.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "funds.overview"
    ],
    "sortOrder": 530,
    "sourceRevision": "1",
    "publication": "published",
    "file": "funds/overview-faq.md",
    "feature": "finance"
  },
  {
    "id": "fund-transactions.overview",
    "slug": "fundtransactions/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "fund-transactions.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/fund-transactions"
    ],
    "relatedIds": [
      "fund-transactions.overview.faq"
    ],
    "sortOrder": 540,
    "sourceRevision": "1",
    "publication": "published",
    "file": "fundtransactions/overview.md",
    "feature": "finance"
  },
  {
    "id": "fund-transactions.overview.faq",
    "slug": "fundtransactions/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "fund-transactions.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "fund-transactions.overview"
    ],
    "sortOrder": 550,
    "sourceRevision": "1",
    "publication": "published",
    "file": "fundtransactions/overview-faq.md",
    "feature": "finance"
  },
  {
    "id": "wallets.mine",
    "slug": "wallets/mine",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "wallets.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/my-wallets"
    ],
    "relatedIds": [
      "wallets.mine.faq"
    ],
    "sortOrder": 560,
    "sourceRevision": "1",
    "publication": "published",
    "file": "wallets/mine.md",
    "feature": "finance"
  },
  {
    "id": "wallets.mine.faq",
    "slug": "wallets/mine-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "wallets.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "wallets.mine"
    ],
    "sortOrder": 570,
    "sourceRevision": "1",
    "publication": "published",
    "file": "wallets/mine-faq.md",
    "feature": "finance"
  },
  {
    "id": "wallets.client",
    "slug": "wallets/client",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "wallets.client"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/client-wallets"
    ],
    "relatedIds": [
      "wallets.client.faq"
    ],
    "sortOrder": 580,
    "sourceRevision": "1",
    "publication": "published",
    "file": "wallets/client.md",
    "feature": "finance"
  },
  {
    "id": "wallets.client.faq",
    "slug": "wallets/client-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "wallets.client"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "wallets.client"
    ],
    "sortOrder": 590,
    "sourceRevision": "1",
    "publication": "published",
    "file": "wallets/client-faq.md",
    "feature": "finance"
  },
  {
    "id": "resellers.overview",
    "slug": "resellers/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "resellers.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/resellers",
      "/resellers/view/:id"
    ],
    "relatedIds": [
      "resellers.overview.faq"
    ],
    "sortOrder": 600,
    "sourceRevision": "1",
    "publication": "published",
    "file": "resellers/overview.md",
    "feature": "resellers"
  },
  {
    "id": "resellers.overview.faq",
    "slug": "resellers/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "resellers.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "resellers.overview"
    ],
    "sortOrder": 610,
    "sourceRevision": "1",
    "publication": "published",
    "file": "resellers/overview-faq.md",
    "feature": "resellers"
  },
  {
    "id": "resellers.create",
    "slug": "resellers/create",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "resellers.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/resellers/create"
    ],
    "relatedIds": [
      "resellers.create.faq"
    ],
    "sortOrder": 620,
    "sourceRevision": "1",
    "publication": "published",
    "file": "resellers/create.md",
    "feature": "resellers"
  },
  {
    "id": "resellers.create.faq",
    "slug": "resellers/create-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "resellers.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "resellers.create"
    ],
    "sortOrder": 630,
    "sourceRevision": "1",
    "publication": "published",
    "file": "resellers/create-faq.md",
    "feature": "resellers"
  },
  {
    "id": "resellers.edit",
    "slug": "resellers/edit",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "resellers.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/resellers/edit/:id"
    ],
    "relatedIds": [
      "resellers.edit.faq"
    ],
    "sortOrder": 640,
    "sourceRevision": "1",
    "publication": "published",
    "file": "resellers/edit.md",
    "feature": "resellers"
  },
  {
    "id": "resellers.edit.faq",
    "slug": "resellers/edit-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "resellers.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "resellers.edit"
    ],
    "sortOrder": 650,
    "sourceRevision": "1",
    "publication": "published",
    "file": "resellers/edit-faq.md",
    "feature": "resellers"
  },
  {
    "id": "agents.overview",
    "slug": "agents/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "agents.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/agents"
    ],
    "relatedIds": [
      "agents.overview.faq"
    ],
    "sortOrder": 660,
    "sourceRevision": "1",
    "publication": "published",
    "file": "agents/overview.md",
    "feature": "inventory"
  },
  {
    "id": "agents.overview.faq",
    "slug": "agents/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "agents.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "agents.overview"
    ],
    "sortOrder": 670,
    "sourceRevision": "1",
    "publication": "published",
    "file": "agents/overview-faq.md",
    "feature": "inventory"
  },
  {
    "id": "agent-transactions.overview",
    "slug": "agenttransactions/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "agent-transactions.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/agent-transactions"
    ],
    "relatedIds": [
      "agent-transactions.overview.faq"
    ],
    "sortOrder": 680,
    "sourceRevision": "1",
    "publication": "published",
    "file": "agenttransactions/overview.md",
    "feature": "inventory"
  },
  {
    "id": "agent-transactions.overview.faq",
    "slug": "agenttransactions/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "agent-transactions.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "agent-transactions.overview"
    ],
    "sortOrder": 690,
    "sourceRevision": "1",
    "publication": "published",
    "file": "agenttransactions/overview-faq.md",
    "feature": "inventory"
  },
  {
    "id": "packages.client",
    "slug": "packages/client",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "packages.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/client-packages",
      "/client-packages/view/:id"
    ],
    "relatedIds": [
      "packages.client.faq"
    ],
    "sortOrder": 700,
    "sourceRevision": "1",
    "publication": "published",
    "file": "packages/client.md",
    "feature": "clients"
  },
  {
    "id": "packages.client.faq",
    "slug": "packages/client-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "packages.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "packages.client"
    ],
    "sortOrder": 710,
    "sourceRevision": "1",
    "publication": "published",
    "file": "packages/client-faq.md",
    "feature": "clients"
  },
  {
    "id": "packages.reseller",
    "slug": "packages/reseller",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "resellers.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/reseller-packages"
    ],
    "relatedIds": [
      "packages.reseller.faq"
    ],
    "sortOrder": 720,
    "sourceRevision": "1",
    "publication": "published",
    "file": "packages/reseller.md",
    "feature": "resellers"
  },
  {
    "id": "packages.reseller.faq",
    "slug": "packages/reseller-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "resellers.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "packages.reseller"
    ],
    "sortOrder": 730,
    "sourceRevision": "1",
    "publication": "published",
    "file": "packages/reseller-faq.md",
    "feature": "resellers"
  },
  {
    "id": "resellers.report",
    "slug": "resellers/report",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "resellers.clients.report"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/reports/reseller-clients"
    ],
    "relatedIds": [
      "resellers.report.faq"
    ],
    "sortOrder": 740,
    "sourceRevision": "1",
    "publication": "published",
    "file": "resellers/report.md",
    "feature": "resellers"
  },
  {
    "id": "resellers.report.faq",
    "slug": "resellers/report-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "resellers.clients.report"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "resellers.report"
    ],
    "sortOrder": 750,
    "sourceRevision": "1",
    "publication": "published",
    "file": "resellers/report-faq.md",
    "feature": "resellers"
  },
  {
    "id": "networks.overview",
    "slug": "networks/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "networks.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/networks"
    ],
    "relatedIds": [
      "networks.overview.faq"
    ],
    "sortOrder": 760,
    "sourceRevision": "1",
    "publication": "published",
    "file": "networks/overview.md",
    "feature": "network"
  },
  {
    "id": "networks.overview.faq",
    "slug": "networks/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "networks.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "networks.overview"
    ],
    "sortOrder": 770,
    "sourceRevision": "1",
    "publication": "published",
    "file": "networks/overview-faq.md",
    "feature": "network"
  },
  {
    "id": "mikrotik.packages",
    "slug": "mikrotik/packages",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "mikrotik-packages.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/mikrotik-packages"
    ],
    "relatedIds": [
      "mikrotik.packages.faq"
    ],
    "sortOrder": 780,
    "sourceRevision": "1",
    "publication": "published",
    "file": "mikrotik/packages.md",
    "feature": "network"
  },
  {
    "id": "mikrotik.packages.faq",
    "slug": "mikrotik/packages-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "mikrotik-packages.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "mikrotik.packages"
    ],
    "sortOrder": 790,
    "sourceRevision": "1",
    "publication": "published",
    "file": "mikrotik/packages-faq.md",
    "feature": "network"
  },
  {
    "id": "mikrotik.sync",
    "slug": "mikrotik/sync",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "mikrotik-sync.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/mikrotik-sync",
      "/mikrotik-sync/import/:id"
    ],
    "relatedIds": [
      "mikrotik.sync.faq"
    ],
    "sortOrder": 800,
    "sourceRevision": "1",
    "publication": "published",
    "file": "mikrotik/sync.md",
    "feature": "network"
  },
  {
    "id": "mikrotik.sync.faq",
    "slug": "mikrotik/sync-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "mikrotik-sync.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "mikrotik.sync"
    ],
    "sortOrder": 810,
    "sourceRevision": "1",
    "publication": "published",
    "file": "mikrotik/sync-faq.md",
    "feature": "network"
  },
  {
    "id": "mikrotik.commands",
    "slug": "mikrotik/commands",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "mikrotik-command.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/mikrotik-commands"
    ],
    "relatedIds": [
      "mikrotik.commands.faq"
    ],
    "sortOrder": 820,
    "sourceRevision": "1",
    "publication": "published",
    "file": "mikrotik/commands.md",
    "feature": "network"
  },
  {
    "id": "mikrotik.commands.faq",
    "slug": "mikrotik/commands-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "mikrotik-command.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "mikrotik.commands"
    ],
    "sortOrder": 830,
    "sourceRevision": "1",
    "publication": "published",
    "file": "mikrotik/commands-faq.md",
    "feature": "network"
  },
  {
    "id": "devices.overview",
    "slug": "devices/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "devices.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/devices"
    ],
    "relatedIds": [
      "devices.overview.faq"
    ],
    "sortOrder": 840,
    "sourceRevision": "1",
    "publication": "published",
    "file": "devices/overview.md",
    "feature": "olts"
  },
  {
    "id": "devices.overview.faq",
    "slug": "devices/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "devices.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "devices.overview"
    ],
    "sortOrder": 850,
    "sourceRevision": "1",
    "publication": "published",
    "file": "devices/overview-faq.md",
    "feature": "olts"
  },
  {
    "id": "device-types.overview",
    "slug": "devicetypes/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "device-types.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/device-types"
    ],
    "relatedIds": [
      "device-types.overview.faq"
    ],
    "sortOrder": 860,
    "sourceRevision": "1",
    "publication": "published",
    "file": "devicetypes/overview.md",
    "feature": "network"
  },
  {
    "id": "device-types.overview.faq",
    "slug": "devicetypes/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "device-types.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "device-types.overview"
    ],
    "sortOrder": 870,
    "sourceRevision": "1",
    "publication": "published",
    "file": "devicetypes/overview-faq.md",
    "feature": "network"
  },
  {
    "id": "olts.overview",
    "slug": "olts/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "olts.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/olts"
    ],
    "relatedIds": [
      "olts.overview.faq"
    ],
    "sortOrder": 880,
    "sourceRevision": "1",
    "publication": "published",
    "file": "olts/overview.md",
    "feature": "olts"
  },
  {
    "id": "olts.overview.faq",
    "slug": "olts/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "olts.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "olts.overview"
    ],
    "sortOrder": 890,
    "sourceRevision": "1",
    "publication": "published",
    "file": "olts/overview-faq.md",
    "feature": "olts"
  },
  {
    "id": "olts.view",
    "slug": "olts/view",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "olts.show"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/olts/view/:id"
    ],
    "relatedIds": [
      "olts.view.faq"
    ],
    "sortOrder": 900,
    "sourceRevision": "1",
    "publication": "published",
    "file": "olts/view.md",
    "feature": "olts"
  },
  {
    "id": "olts.view.faq",
    "slug": "olts/view-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "olts.show"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "olts.view"
    ],
    "sortOrder": 910,
    "sourceRevision": "1",
    "publication": "published",
    "file": "olts/view-faq.md",
    "feature": "olts"
  },
  {
    "id": "olts.test",
    "slug": "olts/test",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "olts.access-test"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/olts/view/:id"
    ],
    "relatedIds": [
      "olts.test.faq"
    ],
    "sortOrder": 920,
    "sourceRevision": "1",
    "publication": "published",
    "file": "olts/test.md",
    "feature": "olts"
  },
  {
    "id": "olts.test.faq",
    "slug": "olts/test-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "olts.access-test"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "olts.test"
    ],
    "sortOrder": 930,
    "sourceRevision": "1",
    "publication": "published",
    "file": "olts/test-faq.md",
    "feature": "olts"
  },
  {
    "id": "olts.monitoring",
    "slug": "olts/monitoring",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "devices.monitoring"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/olts/view/:id/monitoring"
    ],
    "relatedIds": [
      "olts.monitoring.faq"
    ],
    "sortOrder": 940,
    "sourceRevision": "1",
    "publication": "published",
    "file": "olts/monitoring.md",
    "feature": "olts"
  },
  {
    "id": "olts.monitoring.faq",
    "slug": "olts/monitoring-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "devices.monitoring"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "olts.monitoring"
    ],
    "sortOrder": 950,
    "sourceRevision": "1",
    "publication": "published",
    "file": "olts/monitoring-faq.md",
    "feature": "olts"
  },
  {
    "id": "onus.overview",
    "slug": "onus/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "onus.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/onus"
    ],
    "relatedIds": [
      "onus.overview.faq"
    ],
    "sortOrder": 960,
    "sourceRevision": "1",
    "publication": "published",
    "file": "onus/overview.md",
    "feature": "olts"
  },
  {
    "id": "onus.overview.faq",
    "slug": "onus/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "onus.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "onus.overview"
    ],
    "sortOrder": 970,
    "sourceRevision": "1",
    "publication": "published",
    "file": "onus/overview-faq.md",
    "feature": "olts"
  },
  {
    "id": "noc.overview",
    "slug": "noc/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "monitoring.summary"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/noc"
    ],
    "relatedIds": [
      "noc.overview.faq"
    ],
    "sortOrder": 980,
    "sourceRevision": "1",
    "publication": "published",
    "file": "noc/overview.md",
    "feature": "olts"
  },
  {
    "id": "noc.overview.faq",
    "slug": "noc/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "monitoring.summary"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "noc.overview"
    ],
    "sortOrder": 990,
    "sourceRevision": "1",
    "publication": "published",
    "file": "noc/overview-faq.md",
    "feature": "olts"
  },
  {
    "id": "tj-boxes.overview",
    "slug": "tjboxes/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "tj-boxes.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/tj-boxes"
    ],
    "relatedIds": [
      "tj-boxes.overview.faq"
    ],
    "sortOrder": 1000,
    "sourceRevision": "1",
    "publication": "published",
    "file": "tjboxes/overview.md",
    "feature": "network"
  },
  {
    "id": "tj-boxes.overview.faq",
    "slug": "tjboxes/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "tj-boxes.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "tj-boxes.overview"
    ],
    "sortOrder": 1010,
    "sourceRevision": "1",
    "publication": "published",
    "file": "tjboxes/overview-faq.md",
    "feature": "network"
  },
  {
    "id": "tj-boxes.map",
    "slug": "tjboxes/map",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "tj-boxes.map"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/tj-box-maps"
    ],
    "relatedIds": [
      "tj-boxes.map.faq"
    ],
    "sortOrder": 1020,
    "sourceRevision": "1",
    "publication": "published",
    "file": "tjboxes/map.md",
    "feature": "network"
  },
  {
    "id": "tj-boxes.map.faq",
    "slug": "tjboxes/map-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "tj-boxes.map"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "tj-boxes.map"
    ],
    "sortOrder": 1030,
    "sourceRevision": "1",
    "publication": "published",
    "file": "tjboxes/map-faq.md",
    "feature": "network"
  },
  {
    "id": "tickets.overview",
    "slug": "tickets/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "tickets.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/tickets",
      "/tickets/view/:id"
    ],
    "relatedIds": [
      "tickets.overview.faq"
    ],
    "sortOrder": 1040,
    "sourceRevision": "1",
    "publication": "published",
    "file": "tickets/overview.md",
    "feature": "support"
  },
  {
    "id": "tickets.overview.faq",
    "slug": "tickets/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "tickets.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "tickets.overview"
    ],
    "sortOrder": 1050,
    "sourceRevision": "1",
    "publication": "published",
    "file": "tickets/overview-faq.md",
    "feature": "support"
  },
  {
    "id": "subjects.overview",
    "slug": "subjects/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "subjects.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/subjects"
    ],
    "relatedIds": [
      "subjects.overview.faq"
    ],
    "sortOrder": 1060,
    "sourceRevision": "1",
    "publication": "published",
    "file": "subjects/overview.md",
    "feature": "support"
  },
  {
    "id": "subjects.overview.faq",
    "slug": "subjects/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "subjects.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "subjects.overview"
    ],
    "sortOrder": 1070,
    "sourceRevision": "1",
    "publication": "published",
    "file": "subjects/overview-faq.md",
    "feature": "support"
  },
  {
    "id": "tags.overview",
    "slug": "tags/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "tags.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/tags"
    ],
    "relatedIds": [
      "tags.overview.faq"
    ],
    "sortOrder": 1080,
    "sourceRevision": "1",
    "publication": "published",
    "file": "tags/overview.md",
    "feature": "support"
  },
  {
    "id": "tags.overview.faq",
    "slug": "tags/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "tags.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "tags.overview"
    ],
    "sortOrder": 1090,
    "sourceRevision": "1",
    "publication": "published",
    "file": "tags/overview-faq.md",
    "feature": "support"
  },
  {
    "id": "sms.send",
    "slug": "sms/send",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "sms-send.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/sms-send"
    ],
    "relatedIds": [
      "sms.send.faq"
    ],
    "sortOrder": 1100,
    "sourceRevision": "1",
    "publication": "published",
    "file": "sms/send.md",
    "feature": "sms"
  },
  {
    "id": "sms.send.faq",
    "slug": "sms/send-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "sms-send.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "sms.send"
    ],
    "sortOrder": 1110,
    "sourceRevision": "1",
    "publication": "published",
    "file": "sms/send-faq.md",
    "feature": "sms"
  },
  {
    "id": "sms.templates",
    "slug": "sms/templates",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "sms-templates.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/sms-templates"
    ],
    "relatedIds": [
      "sms.templates.faq"
    ],
    "sortOrder": 1120,
    "sourceRevision": "1",
    "publication": "published",
    "file": "sms/templates.md",
    "feature": "sms"
  },
  {
    "id": "sms.templates.faq",
    "slug": "sms/templates-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "sms-templates.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "sms.templates"
    ],
    "sortOrder": 1130,
    "sourceRevision": "1",
    "publication": "published",
    "file": "sms/templates-faq.md",
    "feature": "sms"
  },
  {
    "id": "telegram.overview",
    "slug": "telegram/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "telegram.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/telegram"
    ],
    "relatedIds": [
      "telegram.overview.faq"
    ],
    "sortOrder": 1140,
    "sourceRevision": "1",
    "publication": "published",
    "file": "telegram/overview.md",
    "feature": "sms"
  },
  {
    "id": "telegram.overview.faq",
    "slug": "telegram/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "telegram.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "telegram.overview"
    ],
    "sortOrder": 1150,
    "sourceRevision": "1",
    "publication": "published",
    "file": "telegram/overview-faq.md",
    "feature": "sms"
  },
  {
    "id": "communication.queue",
    "slug": "communication/queue",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "communication-queue.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/communication-queue"
    ],
    "relatedIds": [
      "communication.queue.faq"
    ],
    "sortOrder": 1160,
    "sourceRevision": "1",
    "publication": "published",
    "file": "communication/queue.md",
    "feature": "sms"
  },
  {
    "id": "communication.queue.faq",
    "slug": "communication/queue-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "communication-queue.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "communication.queue"
    ],
    "sortOrder": 1170,
    "sourceRevision": "1",
    "publication": "published",
    "file": "communication/queue-faq.md",
    "feature": "sms"
  },
  {
    "id": "communication.logs",
    "slug": "communication/logs",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "communication-logs.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/communication-logs"
    ],
    "relatedIds": [
      "communication.logs.faq"
    ],
    "sortOrder": 1180,
    "sourceRevision": "1",
    "publication": "published",
    "file": "communication/logs.md",
    "feature": "sms"
  },
  {
    "id": "communication.logs.faq",
    "slug": "communication/logs-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "communication-logs.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "communication.logs"
    ],
    "sortOrder": 1190,
    "sourceRevision": "1",
    "publication": "published",
    "file": "communication/logs-faq.md",
    "feature": "sms"
  },
  {
    "id": "communication.gateways",
    "slug": "communication/gateways",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "communication-gateways.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/communication-gateways"
    ],
    "relatedIds": [
      "communication.gateways.faq"
    ],
    "sortOrder": 1200,
    "sourceRevision": "1",
    "publication": "published",
    "file": "communication/gateways.md",
    "feature": "sms"
  },
  {
    "id": "communication.gateways.faq",
    "slug": "communication/gateways-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "communication-gateways.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "communication.gateways"
    ],
    "sortOrder": 1210,
    "sourceRevision": "1",
    "publication": "published",
    "file": "communication/gateways-faq.md",
    "feature": "sms"
  },
  {
    "id": "products.overview",
    "slug": "products/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "products.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/products"
    ],
    "relatedIds": [
      "products.overview.faq"
    ],
    "sortOrder": 1220,
    "sourceRevision": "1",
    "publication": "published",
    "file": "products/overview.md",
    "feature": "inventory"
  },
  {
    "id": "products.overview.faq",
    "slug": "products/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "products.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "products.overview"
    ],
    "sortOrder": 1230,
    "sourceRevision": "1",
    "publication": "published",
    "file": "products/overview-faq.md",
    "feature": "inventory"
  },
  {
    "id": "products.in",
    "slug": "products/in",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "products-in.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/products/in",
      "/products/in/:id"
    ],
    "relatedIds": [
      "products.in.faq"
    ],
    "sortOrder": 1240,
    "sourceRevision": "1",
    "publication": "published",
    "file": "products/in.md",
    "feature": "inventory"
  },
  {
    "id": "products.in.faq",
    "slug": "products/in-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "products-in.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "products.in"
    ],
    "sortOrder": 1250,
    "sourceRevision": "1",
    "publication": "published",
    "file": "products/in-faq.md",
    "feature": "inventory"
  },
  {
    "id": "products.out",
    "slug": "products/out",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "products-out.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/products/out",
      "/products/out/:id"
    ],
    "relatedIds": [
      "products.out.faq"
    ],
    "sortOrder": 1260,
    "sourceRevision": "1",
    "publication": "published",
    "file": "products/out.md",
    "feature": "inventory"
  },
  {
    "id": "products.out.faq",
    "slug": "products/out-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "products-out.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "products.out"
    ],
    "sortOrder": 1270,
    "sourceRevision": "1",
    "publication": "published",
    "file": "products/out-faq.md",
    "feature": "inventory"
  },
  {
    "id": "products.reports",
    "slug": "products/reports",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "products-in.report"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/products/reports",
      "/reports/product-in",
      "/reports/product-out"
    ],
    "relatedIds": [
      "products.reports.faq"
    ],
    "sortOrder": 1280,
    "sourceRevision": "1",
    "publication": "published",
    "file": "products/reports.md",
    "feature": "inventory"
  },
  {
    "id": "products.reports.faq",
    "slug": "products/reports-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "products-in.report"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "products.reports"
    ],
    "sortOrder": 1290,
    "sourceRevision": "1",
    "publication": "published",
    "file": "products/reports-faq.md",
    "feature": "inventory"
  },
  {
    "id": "product-categories.overview",
    "slug": "productcategories/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "product-categories.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/product-categories"
    ],
    "relatedIds": [
      "product-categories.overview.faq"
    ],
    "sortOrder": 1300,
    "sourceRevision": "1",
    "publication": "published",
    "file": "productcategories/overview.md",
    "feature": "inventory"
  },
  {
    "id": "product-categories.overview.faq",
    "slug": "productcategories/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "product-categories.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "product-categories.overview"
    ],
    "sortOrder": 1310,
    "sourceRevision": "1",
    "publication": "published",
    "file": "productcategories/overview-faq.md",
    "feature": "inventory"
  },
  {
    "id": "unit-types.overview",
    "slug": "unittypes/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "unit-types.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/unit-types"
    ],
    "relatedIds": [
      "unit-types.overview.faq"
    ],
    "sortOrder": 1320,
    "sourceRevision": "1",
    "publication": "published",
    "file": "unittypes/overview.md",
    "feature": "inventory"
  },
  {
    "id": "unit-types.overview.faq",
    "slug": "unittypes/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "unit-types.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "unit-types.overview"
    ],
    "sortOrder": 1330,
    "sourceRevision": "1",
    "publication": "published",
    "file": "unittypes/overview-faq.md",
    "feature": "inventory"
  },
  {
    "id": "vendors.overview",
    "slug": "vendors/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "vendors.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/vendors"
    ],
    "relatedIds": [
      "vendors.overview.faq"
    ],
    "sortOrder": 1340,
    "sourceRevision": "1",
    "publication": "published",
    "file": "vendors/overview.md",
    "feature": "inventory"
  },
  {
    "id": "vendors.overview.faq",
    "slug": "vendors/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "vendors.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "vendors.overview"
    ],
    "sortOrder": 1350,
    "sourceRevision": "1",
    "publication": "published",
    "file": "vendors/overview-faq.md",
    "feature": "inventory"
  },
  {
    "id": "staffs.overview",
    "slug": "staffs/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "staffs.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/staffs"
    ],
    "relatedIds": [
      "staffs.overview.faq"
    ],
    "sortOrder": 1360,
    "sourceRevision": "1",
    "publication": "published",
    "file": "staffs/overview.md",
    "feature": "hr"
  },
  {
    "id": "staffs.overview.faq",
    "slug": "staffs/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "staffs.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "staffs.overview"
    ],
    "sortOrder": 1370,
    "sourceRevision": "1",
    "publication": "published",
    "file": "staffs/overview-faq.md",
    "feature": "hr"
  },
  {
    "id": "staffs.create",
    "slug": "staffs/create",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "staffs.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/staffs/create"
    ],
    "relatedIds": [
      "staffs.create.faq"
    ],
    "sortOrder": 1380,
    "sourceRevision": "1",
    "publication": "published",
    "file": "staffs/create.md",
    "feature": "hr"
  },
  {
    "id": "staffs.create.faq",
    "slug": "staffs/create-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "staffs.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "staffs.create"
    ],
    "sortOrder": 1390,
    "sourceRevision": "1",
    "publication": "published",
    "file": "staffs/create-faq.md",
    "feature": "hr"
  },
  {
    "id": "staffs.edit",
    "slug": "staffs/edit",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "staffs.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/staffs/edit/:id"
    ],
    "relatedIds": [
      "staffs.edit.faq"
    ],
    "sortOrder": 1400,
    "sourceRevision": "1",
    "publication": "published",
    "file": "staffs/edit.md",
    "feature": "hr"
  },
  {
    "id": "staffs.edit.faq",
    "slug": "staffs/edit-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "staffs.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "staffs.edit"
    ],
    "sortOrder": 1410,
    "sourceRevision": "1",
    "publication": "published",
    "file": "staffs/edit-faq.md",
    "feature": "hr"
  },
  {
    "id": "salaries.overview",
    "slug": "salaries/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "salaries.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/salaries"
    ],
    "relatedIds": [
      "salaries.overview.faq"
    ],
    "sortOrder": 1420,
    "sourceRevision": "1",
    "publication": "published",
    "file": "salaries/overview.md",
    "feature": "hr"
  },
  {
    "id": "salaries.overview.faq",
    "slug": "salaries/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "salaries.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "salaries.overview"
    ],
    "sortOrder": 1430,
    "sourceRevision": "1",
    "publication": "published",
    "file": "salaries/overview-faq.md",
    "feature": "hr"
  },
  {
    "id": "salaries.create",
    "slug": "salaries/create",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "salaries.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/salaries/create"
    ],
    "relatedIds": [
      "salaries.create.faq"
    ],
    "sortOrder": 1440,
    "sourceRevision": "1",
    "publication": "published",
    "file": "salaries/create.md",
    "feature": "hr"
  },
  {
    "id": "salaries.create.faq",
    "slug": "salaries/create-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "salaries.create"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "salaries.create"
    ],
    "sortOrder": 1450,
    "sourceRevision": "1",
    "publication": "published",
    "file": "salaries/create-faq.md",
    "feature": "hr"
  },
  {
    "id": "salaries.edit",
    "slug": "salaries/edit",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "salaries.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/salaries/edit/:id"
    ],
    "relatedIds": [
      "salaries.edit.faq"
    ],
    "sortOrder": 1460,
    "sourceRevision": "1",
    "publication": "published",
    "file": "salaries/edit.md",
    "feature": "hr"
  },
  {
    "id": "salaries.edit.faq",
    "slug": "salaries/edit-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "salaries.edit"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "salaries.edit"
    ],
    "sortOrder": 1470,
    "sourceRevision": "1",
    "publication": "published",
    "file": "salaries/edit-faq.md",
    "feature": "hr"
  },
  {
    "id": "roles.overview",
    "slug": "roles/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "roles.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/roles"
    ],
    "relatedIds": [
      "roles.overview.faq"
    ],
    "sortOrder": 1480,
    "sourceRevision": "1",
    "publication": "published",
    "file": "roles/overview.md",
    "feature": "core"
  },
  {
    "id": "roles.overview.faq",
    "slug": "roles/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "roles.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "roles.overview"
    ],
    "sortOrder": 1490,
    "sourceRevision": "1",
    "publication": "published",
    "file": "roles/overview-faq.md",
    "feature": "core"
  },
  {
    "id": "permissions.overview",
    "slug": "permissions/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "permissions.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/permissions",
      "/permissions/:id"
    ],
    "relatedIds": [
      "permissions.overview.faq"
    ],
    "sortOrder": 1500,
    "sourceRevision": "1",
    "publication": "published",
    "file": "permissions/overview.md",
    "feature": "core"
  },
  {
    "id": "permissions.overview.faq",
    "slug": "permissions/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "permissions.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "permissions.overview"
    ],
    "sortOrder": 1510,
    "sourceRevision": "1",
    "publication": "published",
    "file": "permissions/overview-faq.md",
    "feature": "core"
  },
  {
    "id": "notifications.page",
    "slug": "notifications/page",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "notifications.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/notifications"
    ],
    "relatedIds": [
      "notifications.page.faq"
    ],
    "sortOrder": 1520,
    "sourceRevision": "1",
    "publication": "published",
    "file": "notifications/page.md"
  },
  {
    "id": "notifications.page.faq",
    "slug": "notifications/page-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "notifications.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "notifications.page"
    ],
    "sortOrder": 1530,
    "sourceRevision": "1",
    "publication": "published",
    "file": "notifications/page-faq.md"
  },
  {
    "id": "settings.overview",
    "slug": "settings/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "company-settings.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/settings",
      "/settings/general",
      "/settings/dashboard",
      "/settings/sms",
      "/settings/map",
      "/settings/monitoring",
      "/settings/olt",
      "/settings/notifications",
      "/settings/invoice-print"
    ],
    "relatedIds": [
      "settings.overview.faq"
    ],
    "sortOrder": 1540,
    "sourceRevision": "1",
    "publication": "published",
    "file": "settings/overview.md",
    "feature": "core"
  },
  {
    "id": "settings.overview.faq",
    "slug": "settings/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "company-settings.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "settings.overview"
    ],
    "sortOrder": 1550,
    "sourceRevision": "1",
    "publication": "published",
    "file": "settings/overview-faq.md",
    "feature": "core"
  },
  {
    "id": "reports.overview",
    "slug": "reports/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "reports.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/reports",
      "/reports/income-expense",
      "/reports/new-clients",
      "/reports/btrc"
    ],
    "relatedIds": [
      "reports.overview.faq"
    ],
    "sortOrder": 1560,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/overview.md",
    "feature": "core"
  },
  {
    "id": "reports.overview.faq",
    "slug": "reports/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "reports.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "reports.overview"
    ],
    "sortOrder": 1570,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/overview-faq.md",
    "feature": "core"
  },
  {
    "id": "reports.funds",
    "slug": "reports/funds",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "funds.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/reports/funds"
    ],
    "relatedIds": [
      "reports.funds.faq"
    ],
    "sortOrder": 1580,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/funds.md",
    "feature": "finance"
  },
  {
    "id": "reports.funds.faq",
    "slug": "reports/funds-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "funds.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "reports.funds"
    ],
    "sortOrder": 1590,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/funds-faq.md",
    "feature": "finance"
  },
  {
    "id": "reports.invoices",
    "slug": "reports/invoices",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "invoices.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/reports/invoices"
    ],
    "relatedIds": [
      "reports.invoices.faq"
    ],
    "sortOrder": 1600,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/invoices.md",
    "feature": "billing"
  },
  {
    "id": "reports.invoices.faq",
    "slug": "reports/invoices-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "invoices.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "reports.invoices"
    ],
    "sortOrder": 1610,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/invoices-faq.md",
    "feature": "billing"
  },
  {
    "id": "reports.payments",
    "slug": "reports/payments",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "payments.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/reports/payments"
    ],
    "relatedIds": [
      "reports.payments.faq"
    ],
    "sortOrder": 1620,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/payments.md",
    "feature": "billing"
  },
  {
    "id": "reports.payments.faq",
    "slug": "reports/payments-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "payments.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "reports.payments"
    ],
    "sortOrder": 1630,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/payments-faq.md",
    "feature": "billing"
  },
  {
    "id": "reports.expenses",
    "slug": "reports/expenses",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "expenses.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/reports/expenses"
    ],
    "relatedIds": [
      "reports.expenses.faq"
    ],
    "sortOrder": 1640,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/expenses.md",
    "feature": "finance"
  },
  {
    "id": "reports.expenses.faq",
    "slug": "reports/expenses-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "expenses.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "reports.expenses"
    ],
    "sortOrder": 1650,
    "sourceRevision": "1",
    "publication": "published",
    "file": "reports/expenses-faq.md",
    "feature": "finance"
  },
  {
    "id": "histories.overview",
    "slug": "histories/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "histories.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/histories"
    ],
    "relatedIds": [
      "histories.overview.faq"
    ],
    "sortOrder": 1660,
    "sourceRevision": "1",
    "publication": "published",
    "file": "histories/overview.md",
    "feature": "core"
  },
  {
    "id": "histories.overview.faq",
    "slug": "histories/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "histories.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "histories.overview"
    ],
    "sortOrder": 1670,
    "sourceRevision": "1",
    "publication": "published",
    "file": "histories/overview-faq.md",
    "feature": "core"
  },
  {
    "id": "payment-gateways.overview",
    "slug": "paymentgateways/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "payment-gateways.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/payment-gateways"
    ],
    "relatedIds": [
      "payment-gateways.overview.faq"
    ],
    "sortOrder": 1680,
    "sourceRevision": "1",
    "publication": "published",
    "file": "paymentgateways/overview.md",
    "feature": "billing"
  },
  {
    "id": "payment-gateways.overview.faq",
    "slug": "paymentgateways/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "payment-gateways.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "payment-gateways.overview"
    ],
    "sortOrder": 1690,
    "sourceRevision": "1",
    "publication": "published",
    "file": "paymentgateways/overview-faq.md",
    "feature": "billing"
  },
  {
    "id": "staff.profile",
    "slug": "staff/profile",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/staff-profile"
    ],
    "relatedIds": [
      "staff.profile.faq"
    ],
    "sortOrder": 1700,
    "sourceRevision": "1",
    "publication": "published",
    "file": "staff/profile.md"
  },
  {
    "id": "staff.profile.faq",
    "slug": "staff/profile-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "staff.profile"
    ],
    "sortOrder": 1710,
    "sourceRevision": "1",
    "publication": "published",
    "file": "staff/profile-faq.md"
  },
  {
    "id": "company.profile",
    "slug": "company/profile",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "company-settings.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [
      "/company-profile/:id",
      "/reseller-profile/:id"
    ],
    "relatedIds": [
      "company.profile.faq"
    ],
    "sortOrder": 1720,
    "sourceRevision": "1",
    "publication": "published",
    "file": "company/profile.md",
    "feature": "core"
  },
  {
    "id": "company.profile.faq",
    "slug": "company/profile-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "company-settings.access"
    ],
    "requiredAny": [],
    "baseline": false,
    "routePatterns": [],
    "relatedIds": [
      "company.profile"
    ],
    "sortOrder": 1730,
    "sourceRevision": "1",
    "publication": "published",
    "file": "company/profile-faq.md",
    "feature": "core"
  },
  {
    "id": "companies.overview",
    "slug": "companies/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "companies.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/companies"
    ],
    "relatedIds": [
      "companies.overview.faq"
    ],
    "sortOrder": 1740,
    "sourceRevision": "1",
    "publication": "published",
    "file": "companies/overview.md"
  },
  {
    "id": "companies.overview.faq",
    "slug": "companies/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "companies.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "companies.overview"
    ],
    "sortOrder": 1750,
    "sourceRevision": "1",
    "publication": "published",
    "file": "companies/overview-faq.md"
  },
  {
    "id": "users.overview",
    "slug": "users/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "users.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/users"
    ],
    "relatedIds": [
      "users.overview.faq"
    ],
    "sortOrder": 1760,
    "sourceRevision": "1",
    "publication": "published",
    "file": "users/overview.md"
  },
  {
    "id": "users.overview.faq",
    "slug": "users/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "users.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "users.overview"
    ],
    "sortOrder": 1770,
    "sourceRevision": "1",
    "publication": "published",
    "file": "users/overview-faq.md"
  },
  {
    "id": "subscription-plans.overview",
    "slug": "subscriptionplans/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "subscription-plans.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/subscription-plans"
    ],
    "relatedIds": [
      "subscription-plans.overview.faq"
    ],
    "sortOrder": 1780,
    "sourceRevision": "1",
    "publication": "published",
    "file": "subscriptionplans/overview.md"
  },
  {
    "id": "subscription-plans.overview.faq",
    "slug": "subscriptionplans/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "subscription-plans.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "subscription-plans.overview"
    ],
    "sortOrder": 1790,
    "sourceRevision": "1",
    "publication": "published",
    "file": "subscriptionplans/overview-faq.md"
  },
  {
    "id": "subscription-features.overview",
    "slug": "subscriptionfeatures/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "features.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/subscription-features"
    ],
    "relatedIds": [
      "subscription-features.overview.faq"
    ],
    "sortOrder": 1800,
    "sourceRevision": "1",
    "publication": "published",
    "file": "subscriptionfeatures/overview.md"
  },
  {
    "id": "subscription-features.overview.faq",
    "slug": "subscriptionfeatures/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "features.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "subscription-features.overview"
    ],
    "sortOrder": 1810,
    "sourceRevision": "1",
    "publication": "published",
    "file": "subscriptionfeatures/overview-faq.md"
  },
  {
    "id": "company-subscriptions.overview",
    "slug": "companysubscriptions/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "company-subscriptions.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/company-subscriptions"
    ],
    "relatedIds": [
      "company-subscriptions.overview.faq"
    ],
    "sortOrder": 1820,
    "sourceRevision": "1",
    "publication": "published",
    "file": "companysubscriptions/overview.md"
  },
  {
    "id": "company-subscriptions.overview.faq",
    "slug": "companysubscriptions/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "company-subscriptions.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "company-subscriptions.overview"
    ],
    "sortOrder": 1830,
    "sourceRevision": "1",
    "publication": "published",
    "file": "companysubscriptions/overview-faq.md"
  },
  {
    "id": "demo-requests.overview",
    "slug": "demorequests/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "demo-requests.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/demo-requests"
    ],
    "relatedIds": [
      "demo-requests.overview.faq"
    ],
    "sortOrder": 1840,
    "sourceRevision": "1",
    "publication": "published",
    "file": "demorequests/overview.md"
  },
  {
    "id": "demo-requests.overview.faq",
    "slug": "demorequests/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "demo-requests.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "demo-requests.overview"
    ],
    "sortOrder": 1850,
    "sourceRevision": "1",
    "publication": "published",
    "file": "demorequests/overview-faq.md"
  },
  {
    "id": "activity-logs.overview",
    "slug": "activitylogs/overview",
    "kind": "guide",
    "audience": "staff",
    "requiredAll": [
      "activity-logs.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/activity-logs"
    ],
    "relatedIds": [
      "activity-logs.overview.faq"
    ],
    "sortOrder": 1860,
    "sourceRevision": "1",
    "publication": "published",
    "file": "activitylogs/overview.md"
  },
  {
    "id": "activity-logs.overview.faq",
    "slug": "activitylogs/overview-faq",
    "kind": "faq",
    "audience": "staff",
    "requiredAll": [
      "activity-logs.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "activity-logs.overview"
    ],
    "sortOrder": 1870,
    "sourceRevision": "1",
    "publication": "published",
    "file": "activitylogs/overview-faq.md"
  },
  {
    "id": "platform.inbox",
    "slug": "platform/inbox",
    "kind": "guide",
    "audience": "platform",
    "requiredAll": [
      "platform-support-admin.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/platform-support-admin"
    ],
    "relatedIds": [
      "platform.inbox.faq"
    ],
    "sortOrder": 1880,
    "sourceRevision": "1",
    "publication": "published",
    "file": "platform/inbox.md"
  },
  {
    "id": "platform.inbox.faq",
    "slug": "platform/inbox-faq",
    "kind": "faq",
    "audience": "platform",
    "requiredAll": [
      "platform-support-admin.access"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "platform.inbox"
    ],
    "sortOrder": 1890,
    "sourceRevision": "1",
    "publication": "published",
    "file": "platform/inbox-faq.md"
  },
  {
    "id": "platform.thread",
    "slug": "platform/thread",
    "kind": "guide",
    "audience": "platform",
    "requiredAll": [
      "platform-support-admin.show"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [
      "/platform-support-admin/threads/:id"
    ],
    "relatedIds": [
      "platform.thread.faq"
    ],
    "sortOrder": 1900,
    "sourceRevision": "1",
    "publication": "published",
    "file": "platform/thread.md"
  },
  {
    "id": "platform.thread.faq",
    "slug": "platform/thread-faq",
    "kind": "faq",
    "audience": "platform",
    "requiredAll": [
      "platform-support-admin.show"
    ],
    "requiredAny": [],
    "baseline": true,
    "routePatterns": [],
    "relatedIds": [
      "platform.thread"
    ],
    "sortOrder": 1910,
    "sourceRevision": "1",
    "publication": "published",
    "file": "platform/thread-faq.md"
  }
];
// help-features:end

export const HELP_ARTICLES: readonly HelpArticlePolicy[] = [
  ...HELP_CORE_ARTICLES,
  ...HELP_FEATURE_ARTICLES,
];

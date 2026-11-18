import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import path from "node:path";
import { HELP_ARTICLES } from "@/content/help/catalog";
import {
  ANONYMOUS_HELP_ACTOR,
  canReadHelpArticle,
  helpActorFromSettings,
  type HelpActor,
} from "@/lib/help/authorization";
import { matchingHelpArticles } from "@/lib/help/catalog";

function staff(permissions: string[], extra: Partial<HelpActor> = {}): HelpActor {
  return {
    principal: "staff",
    permissions,
    subscriptionState: "active",
    disabledFeatures: [],
    readOnlyFeatures: [],
    ...extra,
  };
}

const article = (id: string) => {
  const found = HELP_ARTICLES.find((item) => item.id === id);
  if (!found) throw new Error(id);
  return found;
};

describe("help authorization", () => {
  it("hides every article from anonymous and client sessions", () => {
    const client: HelpActor = { ...staff(["clients.access", "platform-support.create"]), principal: "client" };
    for (const item of HELP_ARTICLES) {
      expect(canReadHelpArticle(ANONYMOUS_HELP_ACTOR, item)).toBe(false);
      expect(canReadHelpArticle(client, item)).toBe(false);
    }
  });

  it("keeps baseline support articles available without tickets.access or a paid feature", () => {
    const actor = staff([]);
    expect(canReadHelpArticle(actor, article("support.getting-started"))).toBe(true);
    expect(canReadHelpArticle(actor, article("support.contact"))).toBe(true);
    expect(canReadHelpArticle(actor, article("support.faq.contact"))).toBe(true);
    expect(canReadHelpArticle(actor, article("support.create-issue"))).toBe(false);
    expect(canReadHelpArticle(actor, article("clients.overview"))).toBe(false);
    expect(actor.permissions).not.toContain("tickets.access");
  });

  it("requires the action permission for create, chat, images, and conversion", () => {
    const createOnly = staff(["platform-support.create"]);
    expect(canReadHelpArticle(createOnly, article("support.create-issue"))).toBe(true);
    expect(canReadHelpArticle(createOnly, article("support.chat"))).toBe(false);
    expect(canReadHelpArticle(staff(["platform-support.create", "platform-support.reply"]), article("support.chat"))).toBe(true);
    expect(canReadHelpArticle(staff(["platform-support.reply"]), article("support.images"))).toBe(false);
    expect(canReadHelpArticle(staff(["platform-support.upload", "platform-support.reply"]), article("support.images"))).toBe(true);
    expect(canReadHelpArticle(staff(["platform-support.reply"]), article("support.convert-chat"))).toBe(false);
    expect(canReadHelpArticle(staff(["platform-support.convert"]), article("support.convert-chat"))).toBe(true);
  });

  it("splits client overview from client create and follows subscription locks", () => {
    const reader = staff(["clients.access"]);
    expect(canReadHelpArticle(reader, article("clients.overview"))).toBe(true);
    expect(canReadHelpArticle(reader, article("clients.create"))).toBe(false);
    expect(canReadHelpArticle(reader, article("clients.faq.create"))).toBe(false);

    const expiredDisabled = staff(["clients.access", "clients.create"], {
      subscriptionState: "expired",
      disabledFeatures: ["clients"],
    });
    expect(canReadHelpArticle(expiredDisabled, article("clients.overview"))).toBe(false);
    expect(canReadHelpArticle(expiredDisabled, article("clients.create"))).toBe(false);

    const activeWithExpiryMetadata = staff(["clients.access"], {
      subscriptionState: "active",
      disabledFeatures: ["clients"],
    });
    expect(canReadHelpArticle(activeWithExpiryMetadata, article("clients.overview"))).toBe(true);
  });

  it("keeps invoice overview during a read-only billing expiry and hides a write tutorial", () => {
    const actor = staff(["invoices.access", "invoices.create"], {
      subscriptionState: "expired",
      readOnlyFeatures: ["billing"],
    });
    expect(canReadHelpArticle(actor, article("invoices.overview"))).toBe(true);
    const writeTutorial = {
      ...article("invoices.overview"),
      id: "invoices.create",
      requiredAll: ["invoices.create"],
    };
    expect(canReadHelpArticle(actor, writeTutorial)).toBe(false);
  });

  it("changes the allowed set when permissions change and does not copy a bearer token", () => {
    const overview = article("clients.overview");
    expect(canReadHelpArticle(staff([]), overview)).toBe(false);
    expect(canReadHelpArticle(staff(["clients.access"]), overview)).toBe(true);
    const actor = helpActorFromSettings({
      success: true,
      data: {
        permissions: ["clients.access"],
        subscription: { state: "expired", disabled_features: ["billing"], read_only_features: [] },
        token: "secret-bearer",
      },
    });
    expect(actor.permissions).toEqual(["clients.access"]);
    expect(actor.subscriptionState).toBe("expired");
    expect(actor.disabledFeatures).toEqual(["billing"]);
    expect(JSON.stringify(actor)).not.toContain("secret-bearer");
    expect(helpActorFromSettings({ success: false, data: { permissions: ["clients.access"] } }).principal).toBe("anonymous");
  });

  it("hides a platform article from tenant staff", () => {
    const platform = {
      ...article("support.contact"),
      id: "platform.inbox",
      audience: "platform" as const,
      requiredAll: ["platform-support-admin.access"],
      baseline: true,
    };
    expect(canReadHelpArticle(staff(["platform-support.access"]), platform)).toBe(false);
    expect(canReadHelpArticle(staff(["clients.access"]), platform)).toBe(false);
    expect(canReadHelpArticle(staff(["platform-support-admin.access"]), platform)).toBe(true);
  });

  it("matches the client create route ahead of the client list", () => {
    const matches = matchingHelpArticles(HELP_ARTICLES, "/clients/create?name=Ada").map((item) => item.id);
    expect(matches[0]).toBe("clients.create");
    expect(matches).not.toContain("clients.overview");
    expect(matchingHelpArticles(HELP_ARTICLES, "/clients")[0]?.id).toBe("clients.overview");
    expect(matchingHelpArticles(HELP_ARTICLES, "/../clients")).toEqual([]);
  });
});

describe("help files stay server-side", () => {
  it("does not import the help engine from client components or the public folder", () => {
    const root = process.cwd();
    const skip = new Set(["node_modules", ".next", "dist", "tests", "content"]);
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(entry.name)) continue;
        const source = readFileSync(full, "utf8");
        if (!source.includes("\"use client\"") && !source.includes("'use client'")) continue;
        if (source.includes("@/lib/help/") || source.includes("@/content/help")) offenders.push(full);
      }
    };
    walk(root);
    expect(offenders).toEqual([]);
    expect(readFileSync(path.join(root, "lib/help/content.ts"), "utf8")).toContain("import \"server-only\"");
    expect(readFileSync(path.join(root, "lib/help/actor.ts"), "utf8")).toContain("cache: \"no-store\"");
    const helpSource = ["authorization.ts", "catalog.ts", "content.ts", "http.ts", "render.ts", "search.ts", "actor.ts"]
      .map((file) => readFileSync(path.join(root, "lib/help", file), "utf8"))
      .join("\n");
    expect(helpSource).not.toContain("changeLanguage");
  });
});

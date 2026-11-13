import { readFileSync } from "node:fs";
import path from "node:path";
import { HELP_ARTICLES, type HelpArticlePolicy } from "@/content/help/catalog";
import { safeHelpVideoSrc } from "@/components/help/help-reader";
import { type HelpActor } from "@/lib/help/authorization";
import { readableHelpForRoute } from "@/lib/help/context";
import { projectHelpLibrary } from "@/lib/help/content";
import { helpHeadings } from "@/lib/help/headings";
import { helpArticleView, helpContextResponse } from "@/lib/help/http";
import { helpVideoEmbed } from "@/lib/help/video";
import { validateHelpCoverage } from "@/lib/help/validate";
import { describe, expect, it } from "vitest";

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

const library = projectHelpLibrary(false);

describe("help route context", () => {
  it("returns the action guide when the account can open that form", async () => {
    const response = await helpContextResponse(
      new Request("http://help.local/api/help/context?route=/clients/create"),
      { actor: staff(["clients.create"]), library },
    );
    const body = await response.json() as { data: { matched: boolean; page: { id: string; topic: string }[] } };
    expect(body.data.matched).toBe(true);
    expect(body.data.page).toContainEqual(expect.objectContaining({ id: "clients.create", topic: "clients" }));
  });

  it("keeps a forbidden action guide out of the page and falls back to general help", async () => {
    const response = await helpContextResponse(
      new Request(`http://help.local/api/help/context?route=${encodeURIComponent("/clients/create?phone=01700000000#note")}`),
      { actor: staff(["clients.access"]), library },
    );
    const body = await response.json() as {
      data: { matched: boolean; path: string | null; page: { id: string; title: string }[]; general: { id: string; title: string }[] };
    };
    const text = JSON.stringify(body);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(body.data.matched).toBe(false);
    expect(body.data.path).toBe("/clients/create");
    expect(body.data.page).toEqual([]);
    expect(body.data.general.map((card) => card.id)).toEqual([
      "support.getting-started",
      "support.contact",
      "support.faq.contact",
    ]);
    expect(text).not.toContain("Add a client");
    expect(text).not.toContain("01700000000");
    expect(text).not.toContain('"topic":"clients"');
  });

  it("returns general help for an unmapped route and hides platform titles", async () => {
    const response = await helpContextResponse(
      new Request("http://help.local/api/help/context?route=/tables"),
      { actor: staff(["clients.access", "dashboard.access"]), library },
    );
    const body = await response.json() as {
      data: { matched: boolean; page: { title: string }[]; general: { id: string }[] };
    };
    const text = JSON.stringify(body);
    expect(body.data.matched).toBe(false);
    expect(body.data.page).toEqual([]);
    expect(body.data.general.map((card) => card.id)).toContain("support.getting-started");
    expect(text).not.toContain("Platform inbox");
    expect(text).not.toContain("tenant companies");

    const companies = readableHelpForRoute(staff(["dashboard.access"]), HELP_ARTICLES, "/companies");
    expect(companies.page).toEqual([]);
    expect(companies.general.map((article) => article.id)).not.toContain("companies.overview");

    const inbox = await helpContextResponse(
      new Request("http://help.local/api/help/context?route=/platform-support-admin"),
      { actor: staff(["platform-support.access"]), library },
    );
    const inboxText = await inbox.text();
    expect(inboxText).not.toContain("Platform inbox");
    expect(inboxText).not.toContain("platform.inbox");
  });

  it("shows the platform inbox only to an account with the admin permission", async () => {
    const response = await helpContextResponse(
      new Request("http://help.local/api/help/context?route=/platform-support-admin"),
      { actor: staff(["platform-support-admin.access"]), library },
    );
    const body = await response.json() as { data: { matched: boolean; page: { id: string }[] } };
    expect(body.data.matched).toBe(true);
    expect(body.data.page.map((card) => card.id)).toContain("platform.inbox");
  });
});

describe("help video fixtures", () => {
  const fixture = "FixtureVid1";

  it("builds a privacy-enhanced embed without autoplay", () => {
    const embed = helpVideoEmbed(fixture);
    expect(embed?.src.startsWith("https://www.youtube-nocookie.com/embed/")).toBe(true);
    expect(embed?.src).not.toMatch(/autoplay/i);
    expect(helpVideoEmbed("short")).toBeNull();
    expect(helpVideoEmbed("bad id here!")).toBeNull();
    expect(safeHelpVideoSrc(embed?.src)).toBe(embed?.src);
    expect(safeHelpVideoSrc("https://www.youtube.com/embed/FixtureVid1")).toBeNull();
    expect(safeHelpVideoSrc(`${embed?.src}&autoplay=1`)).toBeNull();
  });

  it("keeps Bangla text beside an English-only video id", () => {
    const article = HELP_ARTICLES.find((item) => item.id === "clients.create");
    expect(article).toBeDefined();
    const withVideo: HelpArticlePolicy = { ...article!, videos: { en: fixture } };
    const view = helpArticleView(
      { ...library, articles: [withVideo] },
      staff(["clients.create"]),
      withVideo,
      "bn",
    );
    expect(view?.locale).toBe("bn");
    expect(view?.video).toMatchObject({ id: fixture, spoken_locale: "en" });
    expect(view?.video?.src).not.toMatch(/autoplay/i);
    expect(view?.title).not.toBe("Add a client");
  });
});

describe("help headings and coverage", () => {
  it("assigns stable heading ids without dropping Bangla", () => {
    const headings = helpHeadings("## Open the form\n### Open the form\n## ক্লায়েন্ট যোগ\n");
    expect(headings.map((heading) => heading.id)).toEqual(["open-the-form", "open-the-form-2", "ক্লায়েন্ট-যোগ"]);
  });

  it("covers the dashboard inventory without a published video url", () => {
    const root = path.join(process.cwd(), "content/help");
    const raw = readFileSync(path.join(root, "coverage.json"), "utf8");
    const permissions = JSON.parse(readFileSync(path.join(root, "permission-catalog.json"), "utf8")) as { permissions: string[] };
    const coverage = JSON.parse(raw) as { entries: { video_status: string }[]; excluded: { route: string }[] };
    expect(raw).not.toMatch(/https?:\/\/|youtu\.be/i);
    expect(coverage.entries.every((entry) => entry.video_status === "not_configured")).toBe(true);
    expect(coverage.excluded.map((item) => item.route)).toEqual(expect.arrayContaining([
      "/tables",
      "/import-client",
      "/re-sync",
      "/setting/general",
    ]));
    expect(validateHelpCoverage({
      coverage: JSON.parse(raw),
      articles: HELP_ARTICLES,
      permissions: new Set(permissions.permissions),
      raw,
    })).toEqual([]);
    expect(HELP_ARTICLES.every((article) => !article.videos?.en && !article.videos?.bn)).toBe(true);
  });

  it("keeps the same help translation keys in English and Bangla", () => {
    const english = JSON.parse(readFileSync(path.join(process.cwd(), "public/lang/en.json"), "utf8")) as { help: Record<string, unknown> };
    const bangla = JSON.parse(readFileSync(path.join(process.cwd(), "public/lang/bn.json"), "utf8")) as { help: Record<string, unknown> };
    const flatten = (value: unknown, prefix = ""): string[] => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return [prefix];
      return Object.entries(value).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
    };
    expect(flatten(bangla.help).sort()).toEqual(flatten(english.help).sort());
    expect(bangla.help.description).not.toBe(english.help.description);
  });
});

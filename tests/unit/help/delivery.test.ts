import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tmpdir } from "node:os";
import path from "node:path";
import { HELP_ARTICLES, type HelpArticlePolicy } from "@/content/help/catalog";
import { canReadHelpArticle, type HelpActor } from "@/lib/help/authorization";
import { clearHelpContentCache, loadHelpDocument, projectHelpLibrary, resolveHelpFile, type HelpLibrary } from "@/lib/help/content";
import { helpArticleResponse, helpMediaResponse, helpSearchResponse } from "@/lib/help/http";
import { renderHelpMarkdown } from "@/lib/help/render";
import { normalizeHelpQuery, searchHelpDocuments, visibleHelpDocuments } from "@/lib/help/search";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

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

const full = staff([
  "platform-support.create",
  "platform-support.reply",
  "platform-support.upload",
  "platform-support.convert",
  "clients.access",
  "clients.create",
  "invoices.access",
]);

const library = projectHelpLibrary(false);

function request(url: string, cookie?: string): Request {
  return new Request(url, { headers: cookie ? { cookie } : {} });
}

describe("help renderer", () => {
  const allowed = new Map([["support.contact", "support/contact"]]);

  it("escapes raw html and drops unsafe urls", () => {
    const html = renderHelpMarkdown(
      [
        "Hello <script>alert(1)</script>",
        "[click](javascript:alert(1))",
        "![pixel](data:image/png;base64,aaaa)",
        "[file](file:///tmp/secret)",
        "[remote](https://example.com/ok)",
        "[gone](help:clients.create)",
        "[kept](help:support.contact)",
        "![shot](https://example.com/shot.png)",
        "![local](media/shot.png)",
      ].join("\n\n"),
      "support.contact",
      allowed,
    );
    expect(html).not.toContain("<script");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toMatch(/href="(?:javascript|data|file|vbscript):/i);
    expect(html).toContain("https://example.com/ok");
    expect(html).not.toContain("clients.create");
    expect(html).toContain('href="/help/support/contact"');
    expect(html).not.toContain("example.com/shot.png");
    expect(html).toContain('src="/api/help/media/support.contact/shot.png"');
  });
});

describe("help delivery", () => {
  it("renders authorized articles in the requested language and hides the other session's article", async () => {
    const limited = staff(["platform-support.create"]);
    const [english, bangla, hidden] = await Promise.all([
      helpArticleResponse(request("http://help.local/api/help/articles/clients.create?locale=en"), "clients.create", { actor: full, library }),
      helpArticleResponse(request("http://help.local/api/help/articles/clients.create?locale=bn"), "clients.create", { actor: full, library }),
      helpArticleResponse(request("http://help.local/api/help/articles/clients.create?locale=en"), "clients.create", { actor: limited, library }),
    ]);
    const enBody = await english.json() as { data: { title: string; html: string; video_status: string } };
    const bnBody = await bangla.json() as { data: { title: string; html: string; locale: string } };
    expect(english.status).toBe(200);
    expect(english.headers.get("cache-control")).toBe("private, no-store");
    expect(enBody.data.title).toBe("Add a client");
    expect(enBody.data.html).toContain("Network Package");
    expect(enBody.data.html).not.toContain("<script");
    expect(enBody.data.video_status).toBe("not_configured");
    expect(bnBody.data.locale).toBe("bn");
    expect(bnBody.data.title).toBe("ক্লায়েন্ট যোগ করা");
    expect(hidden.status).toBe(404);
    const hiddenText = await hidden.text();
    expect(hiddenText).not.toContain("Add a client");
    expect(hiddenText).not.toContain("নেটওয়ার্ক প্যাকেজ");
    expect(hiddenText).not.toContain("Network Package");
  });

  it("uses the lang cookie, rejects a bad locale, and omits forbidden related titles", async () => {
    const bangla = await helpArticleResponse(
      request("http://help.local/api/help/articles/support.contact", "lang=bn"),
      "support.contact",
      { actor: staff([]), library },
    );
    const body = await bangla.json() as { data: { title: string; related: { id: string }[] } };
    expect(body.data.title).toBe("প্ল্যাটফর্ম সাপোর্টে যোগাযোগ");
    expect(body.data.related.map((item) => item.id)).toEqual(["support.faq.contact"]);

    const withCreate = await helpArticleResponse(
      request("http://help.local/api/help/articles/support.contact?locale=en"),
      "support.contact",
      { actor: staff(["platform-support.create"]), library },
    );
    const allowed = await withCreate.json() as { data: { related: { title: string }[] } };
    expect(allowed.data.related.map((item) => item.title)).toContain("Report an issue");

    const badLocale = await helpArticleResponse(
      request("http://help.local/api/help/articles/support.contact?locale=../../en"),
      "support.contact",
      { actor: full, library },
    );
    expect(badLocale.status).toBe(404);
    const traversal = await helpArticleResponse(
      request("http://help.local/api/help/articles/..%2Fpackage"),
      "../package",
      { actor: full, library },
    );
    expect(traversal.status).toBe(404);
    expect(await traversal.text()).not.toContain("name");
    const signedOut = await helpArticleResponse(
      request("http://help.local/api/help/articles/support.contact"),
      "support.contact",
      { actor: { ...full, principal: "anonymous" }, library },
    );
    expect(signedOut.status).toBe(401);
  });

  it("searches only authorized text and does not echo a private query", async () => {
    const found = await helpSearchResponse(
      request("http://help.local/api/help/search?q=pppoe&locale=en&route=/clients/create"),
      { actor: full, library },
    );
    const payload = await found.json() as { data: { results: { id: string; snippet: string }[] } };
    expect(found.headers.get("cache-control")).toBe("private, no-store");
    expect(payload.data.results[0]?.id).toBe("clients.create");
    expect(payload.data.results.some((item) => item.id === "invoices.overview")).toBe(false);

    const denied = await helpSearchResponse(
      request("http://help.local/api/help/search?q=Network%20Package&locale=en"),
      { actor: staff(["clients.access"]), library },
    );
    const deniedText = await denied.text();
    expect(deniedText).not.toContain("Network Package");
    expect(deniedText).not.toContain("Add a client");

    const secret = "customer-secret-query-should-not-be-logged";
    const tooLong = await helpSearchResponse(
      request(`http://help.local/api/help/search?q=${secret}${"x".repeat(80)}`),
      { actor: full, library },
    );
    expect(tooLong.status).toBe(400);
    expect(await tooLong.text()).not.toContain(secret);
    expect(normalizeHelpQuery(`ক্লায়েন্ট\u200b`)).toBe("ক্লায়েন্ট");
  });

  it("serves a protected image only with the parent article and blocks path escapes", async () => {
    clearHelpContentCache();
    const root = mkdtempSync(path.join(tmpdir(), "help-media-"));
    const policy: HelpArticlePolicy = {
      ...HELP_ARTICLES[0],
      id: "support.images",
      slug: "support/images",
      file: "support/images.md",
      requiredAll: ["platform-support.upload", "platform-support.reply"],
    };
    const local: HelpLibrary = { root, articles: [policy], allowDrafts: false };
    mkdirSync(path.join(root, "en/support"), { recursive: true });
    mkdirSync(path.join(root, "media/support.images"), { recursive: true });
    writeFileSync(path.join(root, "en/support/images.md"), [
      "---",
      "title: Images",
      "summary: Images",
      "keywords:",
      "  - image",
      "language: en",
      "translated_from_revision: \"1\"",
      "---",
      "Use a local image.",
    ].join("\n"));
    writeFileSync(path.join(root, "media/support.images/shot.png"), PNG);
    const allowed = await helpMediaResponse("support.images", "shot.png", { actor: full, library: local });
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get("content-type")).toBe("image/png");
    expect(allowed.headers.get("x-content-type-options")).toBe("nosniff");
    expect(allowed.headers.get("cache-control")).toBe("private, no-store");
    const denied = await helpMediaResponse("support.images", "shot.png", {
      actor: staff([]),
      library: local,
    });
    expect(denied.status).toBe(404);
    expect(await helpMediaResponse("support.images", "../shot.png", { actor: full, library: local })).toMatchObject({ status: 404 });
    expect(resolveHelpFile(root, "en", "../package.json")).toBeNull();
    expect(resolveHelpFile(root, "../en", "support/images.md")).toBeNull();
  });

  it("allows a development-only English fallback for a draft and refuses it for published text", () => {
    clearHelpContentCache();
    const root = mkdtempSync(path.join(tmpdir(), "help-draft-"));
    mkdirSync(path.join(root, "en/support"), { recursive: true });
    writeFileSync(path.join(root, "en/support/draft.md"), [
      "---",
      "title: Draft only",
      "summary: English draft",
      "keywords:",
      "  - draft",
      "language: en",
      "translated_from_revision: \"9\"",
      "---",
      "Draft body.",
    ].join("\n"));
    const draft: HelpArticlePolicy = {
      id: "support.draft",
      slug: "support/draft",
      kind: "guide",
      audience: "staff",
      requiredAll: [],
      requiredAny: [],
      baseline: true,
      routePatterns: [],
      relatedIds: [],
      sortOrder: 1,
      sourceRevision: "9",
      publication: "draft",
      developmentEnglishFallback: true,
      file: "support/draft.md",
    };
    const actor = staff([]);
    const dev: HelpLibrary = { root, articles: [draft], allowDrafts: true };
    const fallback = loadHelpDocument(dev, draft, "bn");
    expect(fallback?.fallback).toBe(true);
    expect(fallback?.title).toBe("Draft only");
    expect(canReadHelpArticle(actor, draft, { allowDrafts: false })).toBe(false);
    const published = { ...draft, publication: "published" as const, developmentEnglishFallback: false };
    expect(loadHelpDocument({ root, articles: [published], allowDrafts: false }, published, "bn")).toBeNull();
    const visible = visibleHelpDocuments(dev, actor, "bn");
    expect(searchHelpDocuments(visible, "draft", null)[0]?.title).toBe("Draft only");
  });
});

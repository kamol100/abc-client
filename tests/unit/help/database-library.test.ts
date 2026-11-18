import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "@/app/actions";
import { loadHelpActor } from "@/lib/help/actor";
import { loadHelpArticle } from "@/lib/help/pages";
import { loadDatabaseHelp } from "@/lib/help/database-library";
import { helpArticleResponse, helpContextResponse, helpSearchResponse } from "@/lib/help/http";

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "bn" }) }) }));
vi.mock("@/lib/help/actor", () => ({ loadHelpActor: vi.fn() }));

const article = {
  id: "example.dynamic", slug: "example/dynamic", kind: "guide", topic: "example",
  topic_label: "উদাহরণ", title: "নতুন গাইড", summary: "**সহায়তা**", body: "## নতুন ধাপ",
  video: "abcdefghijk", keywords: ["নতুন"],
  route_patterns: ["/clients/:id"], related_ids: ["platform.inbox"], sort_order: 10,
};

beforeEach(() => vi.resetAllMocks());

describe("database-backed Help", () => {
  it("renders localized database content through article, context and search responses", async () => {
    vi.mocked(useFetch).mockResolvedValue({ success: true, status: 200, data: [article] });
    const deps = await loadDatabaseHelp("bn");
    expect(useFetch).toHaveBeenCalledWith({ url: "help-library?locale=bn" });
    const result = await helpArticleResponse(new Request("http://help.test?locale=bn"), article.id, deps);
    const body = await result.json();
    expect(body.data).toMatchObject({
      title: article.title, summary: "সহায়তা", summary_html: "<p><strong>সহায়তা</strong></p>\n", locale: "bn", related: [], video: { spoken_locale: "en" },
    });
    expect(body.data.html).toContain("নতুন ধাপ");
    expect((await helpArticleResponse(new Request("http://help.test?locale=bn"), "platform.inbox", deps)).status).toBe(404);

    const context = await helpContextResponse(new Request("http://help.test?locale=bn&route=/clients/123"), deps);
    expect((await context.json()).data.page).toMatchObject([{ id: article.id, topic_label: article.topic_label }]);
    const search = await helpSearchResponse(new Request("http://help.test?locale=bn&q=" + encodeURIComponent("নতুন")), deps);
    expect((await search.json()).data.results).toMatchObject([{ id: article.id }]);
    expect(loadHelpActor).not.toHaveBeenCalled();
  });

  it("opens published articles at generated hyphenated URLs", async () => {
    const created = { ...article, id: "example-video-2", slug: "example-video-2" };
    vi.mocked(useFetch).mockResolvedValue({ success: true, status: 200, data: [created] });
    expect(await loadHelpArticle(created.slug)).toMatchObject({ id: created.id, title: created.title });
  });

  it("uses static Help before seed completion and fails closed for authorization errors", async () => {
    vi.mocked(loadHelpActor).mockResolvedValue({
      principal: "staff", permissions: [], subscriptionState: null, disabledFeatures: [], readOnlyFeatures: [],
    });
    vi.mocked(useFetch).mockResolvedValueOnce({ success: false, status: 503, error: { code: "help_library_unseeded" } });
    const unseeded = await loadDatabaseHelp("en");
    expect(unseeded.actor.principal).toBe("staff");
    expect(unseeded.library.articles).toHaveLength(182);
    vi.mocked(useFetch).mockResolvedValueOnce({ success: false, status: 403 });
    expect((await loadDatabaseHelp("bn")).actor.principal).toBe("anonymous");
    expect(loadHelpActor).toHaveBeenCalledOnce();
  });
});

import { afterEach, describe, expect, test, vi } from "vitest";
import { apiProxyPath, buildApiProxyUrl } from "@/lib/api/api-proxy-url";

const { apiGet } = await vi.importActual<typeof import("@/lib/api/api-get")>("@/lib/api/api-get");

const BASE = "https://api.example.test";

describe("buildApiProxyUrl", () => {
    // প্রক্সি পাথ থেকে Laravel-এর ভার্সনসহ URL তৈরি হয় এবং কুয়েরি স্ট্রিং অপরিবর্তিত থাকে কি না যাচাই করি।
    test("Read proxy URL: builds the versioned API URL and keeps the query string", () => {
        expect(buildApiProxyUrl(`${BASE}/`, ["v1", "clients", "12"], "?page=2&status=1")).toBe(
            `${BASE}/api/v1/clients/12?page=2&status=1`,
        );
    });

    // পাথের অংশে বিশেষ অক্ষর থাকলে তা এনকোড হয়ে একই অংশের ভেতরে থাকে কি না যাচাই করি।
    test("Read proxy URL: encodes a segment so a slash or space stays inside it", () => {
        expect(buildApiProxyUrl(BASE, ["v1", "clients", "a b/c"])).toBe(`${BASE}/api/v1/clients/a%20b%2Fc`);
    });

    // ভুল ভার্সন, ফাঁকা পাথ, `..` বা বেস URL না থাকলে প্রক্সি কোনো URL তৈরি করে না কি না যাচাই করি।
    test.each([
        ["no base URL", undefined, ["v1", "clients"]],
        ["a version that is not like v1", BASE, ["admin", "clients"]],
        ["only a version", BASE, ["v1"]],
        ["a parent-directory segment", BASE, ["v1", "..", "secret"]],
        ["a current-directory segment", BASE, ["v1", ".", "clients"]],
    ])("Read proxy URL: refuses %s", (_label, base, segments) => {
        expect(buildApiProxyUrl(base, segments)).toBeNull();
    });

    // ব্রাউজারের দিকের প্রক্সি পাথে ভার্সন যোগ হয় এবং শুরুর স্ল্যাশ থাকুক বা না থাকুক একই ফল আসে কি না যাচাই করি।
    test("Read proxy path: adds the version whether or not the API path starts with a slash", () => {
        expect(apiProxyPath("clients/12?page=1")).toBe("/api/proxy/v1/clients/12?page=1");
        expect(apiProxyPath("/clients/12", "v2")).toBe("/api/proxy/v2/clients/12");
    });
});

describe("apiGet", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    // apiGet প্রক্সি রুটে GET পাঠায় এবং API-র JSON খাম হুবহু ফেরত দেয় কি না যাচাই করি।
    test("Read request: calls the proxy route and returns the API envelope", async () => {
        const envelope = { success: true, data: { id: 12 } };
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(envelope), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiGet({ url: "/clients/12" })).resolves.toEqual(envelope);
        expect(fetchMock).toHaveBeenCalledWith("/api/proxy/v1/clients/12", expect.objectContaining({ method: "GET" }));
    });

    // নেটওয়ার্ক ব্যর্থ হলে বা উত্তর JSON না হলে আগের মতো success:false খাম ফেরত আসে কি না যাচাই করি।
    test.each([
        ["the network fails", () => Promise.reject(new TypeError("offline"))],
        ["the body is not JSON", () => Promise.resolve(new Response("<html>502</html>", { status: 502 }))],
    ])("Read request: returns a failed envelope when %s", async (_label, respond) => {
        vi.stubGlobal("fetch", vi.fn().mockImplementation(respond));

        await expect(apiGet({ url: "clients" })).resolves.toMatchObject({ success: false, status: 500 });
    });
});

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.fn();
vi.mock("@/auth/auth", () => ({ auth: () => authMock() }));

const { GET } = await import("@/app/api/proxy/[...path]/route");

function call(path: string[], search = "") {
    const req = new NextRequest(`http://app.test/api/proxy/${path.join("/")}${search}`);
    return GET(req, { params: Promise.resolve({ path }) });
}

describe("read proxy route", () => {
    beforeEach(() => {
        vi.stubEnv("NEXTAPI_URL", "https://api.example.test");
        authMock.mockResolvedValue({ token: "test-token" });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        authMock.mockReset();
    });

    // লগইন করা ব্যবহারকারীর টোকেন দিয়ে Laravel-এ GET যায় এবং স্ট্যাটাস ও বডি হুবহু ফেরত আসে কি না যাচাই করি।
    test("Read proxy: forwards the GET with the session token and returns the API status and body", async () => {
        const body = JSON.stringify({ success: false, message: "Forbidden" });
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(body, { status: 403, headers: { "content-type": "application/json" } }),
        );
        vi.stubGlobal("fetch", fetchMock);

        const res = await call(["v1", "clients", "12"], "?page=1");

        expect(res.status).toBe(403);
        expect(await res.text()).toBe(body);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("https://api.example.test/api/v1/clients/12?page=1");
        expect(init.headers.Authorization).toBe("Bearer test-token");
    });

    // সেশন না থাকলে API-তে কিছু না পাঠিয়ে 401 ফেরত দেয় কি না যাচাই করি।
    test("Read proxy: returns 401 without calling the API when there is no session", async () => {
        authMock.mockResolvedValue(null);
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const res = await call(["v1", "clients"]);

        expect(res.status).toBe(401);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // ভার্সনের বাইরে যাওয়া পাথে (`..`) API কল না করে 404 ফেরত দেয় কি না যাচাই করি।
    test("Read proxy: returns 404 for a path that would leave the versioned API", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        const res = await call(["v1", "..", "admin"]);

        expect(res.status).toBe(404);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

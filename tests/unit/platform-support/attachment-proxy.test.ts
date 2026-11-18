import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as requesterUpload } from "@/app/api/platform-support/uploads/route";
import { GET as requesterAttachment } from "@/app/api/platform-support/attachments/[attachment]/route";
import { DELETE as adminDelete } from "@/app/api/platform-support-admin/uploads/[upload]/route";
import { auth } from "@/auth/auth";
import {
  proxySupportAttachment,
  proxySupportDelete,
  proxySupportUpload,
  readBoundedBody,
  supportMutationAllowed,
} from "@/lib/platform-support/attachment-proxy";
import { SUPPORT_UPLOAD_MAX_REQUEST_BYTES } from "@/lib/platform-support/attachment-transport";

vi.mock("@/auth/auth", () => ({
  auth: vi.fn(),
}));

const ATTACHMENT_ID = "11111111-1111-4111-8111-111111111111";
const authMock = vi.mocked(auth);

function mutationRequest(url: string, init: RequestInit & { headers?: HeadersInit } = {}): Request {
  const headers = new Headers(init.headers);
  if (!headers.has("Origin")) headers.set("Origin", "https://isp.test");
  if (!headers.has("Host")) headers.set("Host", "isp.test");
  if (!headers.has("X-Requested-With")) headers.set("X-Requested-With", "XMLHttpRequest");
  return new Request(url, { ...init, headers });
}

describe("support image proxy", () => {
  beforeEach(() => {
    process.env.NEXTAPI_URL = "http://api.test";
    authMock.mockReset();
    authMock.mockResolvedValue({ token: "sanctum-token" } as never);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXTAPI_URL;
  });

  it("rejects a cross-site or headerless mutation before any upstream call", async () => {
    const fetchMock = vi.mocked(fetch);
    const crossSite = mutationRequest("https://isp.test/api/platform-support/uploads", {
      method: "POST",
      headers: { Origin: "https://evil.example", "Content-Type": "multipart/form-data; boundary=x" },
      body: new Uint8Array([1]),
    });

    expect(supportMutationAllowed(crossSite)).toBe(false);
    const denied = await proxySupportUpload(crossSite, "requester");
    expect(denied.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops a declared body over 6 MiB and a stream that grows past the cap", async () => {
    const oversized = mutationRequest("https://isp.test/api/platform-support/uploads", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data; boundary=x",
        "Content-Length": String(SUPPORT_UPLOAD_MAX_REQUEST_BYTES + 1),
      },
      body: new Uint8Array([1]),
    });

    const rejected = await requesterUpload(oversized);
    expect(rejected.status).toBe(413);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(6));
        controller.enqueue(new Uint8Array(6));
        controller.close();
      },
    });
    const grown = new Request("https://isp.test/upload", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit);
    expect(await readBoundedBody(grown, 8)).toBeNull();
    const small = new Request("https://isp.test/upload", { method: "POST", body: new Uint8Array([1, 2, 3]) });
    expect(Array.from((await readBoundedBody(small, 8)) ?? [])).toEqual([1, 2, 3]);
  });

  it("forwards one fixed upstream path and preserves error statuses", async () => {
    const fetchMock = vi.mocked(fetch);
    for (const status of [401, 403, 404, 413, 422, 429]) {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, error: { code: "platform_support.image_invalid" } }), {
          status,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "3",
            "Set-Cookie": "session=secret",
          },
        }),
      );
      const response = await proxySupportUpload(
        mutationRequest("https://isp.test/api/platform-support/uploads", {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data; boundary=bound" },
          body: new Uint8Array([9, 8]),
        }),
        "requester",
      );
      expect(response.status).toBe(status);
      expect(response.headers.get("Retry-After")).toBe("3");
      expect(response.headers.get("Set-Cookie")).toBeNull();
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    }

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.test/api/v1/platform-support/uploads");
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer sanctum-token");
    expect(headers.get("Content-Type")).toBe("multipart/form-data; boundary=bound");
    expect(headers.get("Cookie")).toBeNull();
    expect(init.body).toBeInstanceOf(ArrayBuffer);
  });

  it("streams an authorized image and refuses ids that are not uuids", async () => {
    const bytes = Uint8Array.from([137, 80, 78, 71]);
    vi.mocked(fetch).mockResolvedValue(
      new Response(bytes, { status: 200, headers: { "Content-Type": "image/png" } }),
    );

    const image = await requesterAttachment(new Request("https://isp.test/image"), {
      params: Promise.resolve({ attachment: ATTACHMENT_ID }),
    });
    expect(image.status).toBe(200);
    expect(image.headers.get("Content-Type")).toBe("image/png");
    expect(image.headers.get("Cache-Control")).toBe("private, no-store");
    expect(image.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(new Uint8Array(await image.arrayBuffer())).toEqual(bytes);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe(
      `http://api.test/api/v1/platform-support/attachments/${ATTACHMENT_ID}`,
    );

    const missing = await proxySupportAttachment("platform", "https://evil.example/file.png");
    expect(missing.status).toBe(404);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it("deletes through the admin path and does not call upstream without a session", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const removed = await adminDelete(
      mutationRequest("https://isp.test/api/platform-support-admin/uploads/" + ATTACHMENT_ID, { method: "DELETE" }),
      { params: Promise.resolve({ upload: ATTACHMENT_ID }) },
    );
    expect(removed.status).toBe(200);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe(
      `http://api.test/api/v1/platform-support-admin/uploads/${ATTACHMENT_ID}`,
    );

    authMock.mockResolvedValue(null as never);
    const anonymous = await proxySupportDelete(
      mutationRequest("https://isp.test/api/platform-support/uploads/" + ATTACHMENT_ID, { method: "DELETE" }),
      "requester",
      ATTACHMENT_ID,
    );
    expect(anonymous.status).toBe(401);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SUPPORT_IMAGE_MAX_BYTES,
  SUPPORT_UPLOAD_MAX_REQUEST_BYTES,
  deleteSupportUpload,
  supportAttachmentPath,
  supportImageErrorKey,
  supportUploadPath,
  uploadSupportImage,
} from "@/lib/platform-support/attachment-transport";

const ATTACHMENT_ID = "11111111-1111-4111-8111-111111111111";

describe("support image paths", () => {
  it("keeps requester and platform uploads on fixed same-origin paths", () => {
    expect(supportUploadPath("requester")).toBe("/api/platform-support/uploads");
    expect(supportUploadPath("platform")).toBe("/api/platform-support-admin/uploads");
    expect(supportAttachmentPath("requester", ATTACHMENT_ID)).toBe(
      `/api/platform-support/attachments/${ATTACHMENT_ID}`,
    );
    expect(supportAttachmentPath("platform", ATTACHMENT_ID)).toBe(
      `/api/platform-support-admin/attachments/${ATTACHMENT_ID}`,
    );
  });

  it("rejects an attachment id that is not a uuid", () => {
    expect(supportAttachmentPath("requester", "../api/v1/clients/1")).toBeNull();
    expect(supportAttachmentPath("requester", "not-a-uuid")).toBeNull();
  });

  it("maps API error codes onto translation keys and keeps the 5 and 6 MiB caps", () => {
    expect(SUPPORT_IMAGE_MAX_BYTES).toBe(5 * 1024 * 1024);
    expect(SUPPORT_UPLOAD_MAX_REQUEST_BYTES).toBe(6 * 1024 * 1024);
    expect(supportImageErrorKey("platform_support.image_too_large")).toBe(
      "platform_support.errors.image_too_large",
    );
    expect(supportImageErrorKey("platform_support.request_too_large")).toBe(
      "platform_support.errors.request_too_large",
    );
    expect(supportImageErrorKey("platform_support.unknown")).toBe("platform_support.errors.image_invalid");
    expect(supportImageErrorKey(null)).toBe("platform_support.errors.image_invalid");
  });
});

describe("support image client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts one file to the same-origin route and preserves the upstream status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: { code: "platform_support.image_too_large" } }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await uploadSupportImage({
      audience: "platform",
      file: new Blob([Uint8Array.from([1, 2, 3])], { type: "image/png" }),
      filename: "note.png",
      threadId: ATTACHMENT_ID,
    });

    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(result.body).toMatchObject({ error: { code: "platform_support.image_too_large" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/platform-support-admin/uploads");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("same-origin");
    expect(init.body).toBeInstanceOf(FormData);
    const headers = new Headers(init.headers);
    expect(headers.get("X-Requested-With")).toBe("XMLHttpRequest");
    expect(headers.get("Authorization")).toBeNull();
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("does not call the network for a delete id that is not a uuid", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await deleteSupportUpload({ audience: "requester", uploadId: "https://evil.example/upload" });

    expect(result.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

/**
 * Browser transport for platform-support images.
 *
 * The browser posts to the same-origin handlers under app/api/platform-support
 * and app/api/platform-support-admin. Those handlers attach the Sanctum bearer
 * from the NextAuth session. This module never reads or sends that bearer.
 *
 * Do not send these files through a server action. next.config.ts does not set
 * serverActions.bodySizeLimit, and this feature does not add one. The route
 * handler rejects a body over 6 MiB before it reaches PHP. The API then
 * rejects image bytes over 5 MiB.
 *
 * Production still needs, and this change does not set:
 * PHP memory_limit >= 512M, PHP upload_max_filesize and post_max_size >= 6M,
 * and the web server body limit (nginx client_max_body_size) >= 6m.
 * Legacy profile and customer images stay at 2 MB.
 */

export const SUPPORT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const SUPPORT_UPLOAD_MAX_REQUEST_BYTES = 6 * 1024 * 1024;

export type SupportImageAudience = "requester" | "platform";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const BROWSER_PATHS = {
  requester: {
    uploads: "/api/platform-support/uploads",
    attachments: "/api/platform-support/attachments",
  },
  platform: {
    uploads: "/api/platform-support-admin/uploads",
    attachments: "/api/platform-support-admin/attachments",
  },
} as const;

const ERROR_KEYS: Record<string, string> = {
  "platform_support.image_invalid": "platform_support.errors.image_invalid",
  "platform_support.image_too_large": "platform_support.errors.image_too_large",
  "platform_support.image_dimensions": "platform_support.errors.image_dimensions",
  "platform_support.image_encoder_unavailable": "platform_support.errors.image_encoder_unavailable",
  "platform_support.request_too_large": "platform_support.errors.request_too_large",
  "platform_support.attachment_invalid": "platform_support.errors.attachment_invalid",
  "platform_support.attachment_expired": "platform_support.errors.attachment_expired",
  "platform_support.attachment_consumed": "platform_support.errors.attachment_consumed",
  "platform_support.duplicate_attachment": "platform_support.errors.duplicate_attachment",
  "platform_support.too_many_attachments": "platform_support.errors.too_many_attachments",
  "platform_support.draft_required": "platform_support.errors.draft_required",
};

export interface SupportTransportResult {
  ok: boolean;
  status: number;
  body: unknown;
}

export function supportUploadPath(audience: SupportImageAudience): string {
  return BROWSER_PATHS[audience].uploads;
}

export function supportUploadDeletePath(audience: SupportImageAudience, uploadId: string): string | null {
  if (!UUID.test(uploadId)) return null;
  return `${BROWSER_PATHS[audience].uploads}/${uploadId}`;
}

export function supportAttachmentPath(audience: SupportImageAudience, attachmentId: string): string | null {
  if (!UUID.test(attachmentId)) return null;
  return `${BROWSER_PATHS[audience].attachments}/${attachmentId}`;
}

export function supportImageErrorKey(code: string | null | undefined): string {
  if (!code) return "platform_support.errors.image_invalid";
  return ERROR_KEYS[code] ?? "platform_support.errors.image_invalid";
}

export async function uploadSupportImage(input: {
  audience: SupportImageAudience;
  file: Blob;
  filename?: string;
  threadId?: string;
  draftId?: string;
}): Promise<SupportTransportResult> {
  const form = new FormData();
  const filename = input.filename ?? "image";
  form.set("file", input.file, filename);
  if (input.threadId) form.set("thread_id", input.threadId);
  if (input.draftId) form.set("draft_id", input.draftId);

  const response = await fetch(supportUploadPath(input.audience), {
    method: "POST",
    body: form,
    credentials: "same-origin",
    headers: mutationHeaders(),
  });

  return readJsonResult(response);
}

export async function deleteSupportUpload(input: {
  audience: SupportImageAudience;
  uploadId: string;
}): Promise<SupportTransportResult> {
  const path = supportUploadDeletePath(input.audience, input.uploadId);
  if (!path) {
    return {
      ok: false,
      status: 404,
      body: { success: false, status: 404, error: { code: "platform_support.not_found" } },
    };
  }

  const response = await fetch(path, {
    method: "DELETE",
    credentials: "same-origin",
    headers: mutationHeaders(),
  });

  return readJsonResult(response);
}

function mutationHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
}

async function readJsonResult(response: Response): Promise<SupportTransportResult> {
  const body: unknown = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, body };
}

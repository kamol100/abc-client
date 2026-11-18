import { auth } from "@/auth/auth";
import {
  SUPPORT_UPLOAD_MAX_REQUEST_BYTES,
  type SupportImageAudience,
} from "@/lib/platform-support/attachment-transport";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UPSTREAM_PATHS = {
  requester: {
    uploads: "/api/v1/platform-support/uploads",
    attachments: "/api/v1/platform-support/attachments",
  },
  platform: {
    uploads: "/api/v1/platform-support-admin/uploads",
    attachments: "/api/v1/platform-support-admin/attachments",
  },
} as const;

interface ForwardOptions {
  method: "GET" | "POST" | "DELETE";
  body?: Uint8Array;
  contentType?: string;
  image?: boolean;
}

export function supportMutationAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || request.headers.get("x-requested-with") !== "XMLHttpRequest") {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readBoundedBody(request: Request, maxBytes: number): Promise<Uint8Array | null> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const length = Number(declared);
    if (!Number.isFinite(length) || length < 0 || length > maxBytes) return null;
  }

  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const next = await reader.read();
    if (next.done) break;
    const value = next.value;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

export async function proxySupportUpload(request: Request, audience: SupportImageAudience): Promise<Response> {
  if (!supportMutationAllowed(request)) {
    return jsonError(403, "platform_support.forbidden", "This upload must come from the same site.");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return jsonError(422, "platform_support.image_invalid", "The upload must be a file.");
  }

  const body = await readBoundedBody(request, SUPPORT_UPLOAD_MAX_REQUEST_BYTES);
  if (!body) {
    return jsonError(413, "platform_support.request_too_large", "The upload is larger than 6 MiB.");
  }

  return forward(UPSTREAM_PATHS[audience].uploads, {
    method: "POST",
    body,
    contentType,
  });
}

export async function proxySupportDelete(
  request: Request,
  audience: SupportImageAudience,
  uploadId: string,
): Promise<Response> {
  if (!supportMutationAllowed(request)) {
    return jsonError(403, "platform_support.forbidden", "This upload must come from the same site.");
  }
  if (!UUID.test(uploadId)) {
    return jsonError(404, "platform_support.not_found", "Image not found.");
  }

  return forward(`${UPSTREAM_PATHS[audience].uploads}/${uploadId}`, { method: "DELETE" });
}

export async function proxySupportAttachment(
  audience: SupportImageAudience,
  attachmentId: string,
): Promise<Response> {
  if (!UUID.test(attachmentId)) {
    return jsonError(404, "platform_support.not_found", "Image not found.");
  }

  return forward(`${UPSTREAM_PATHS[audience].attachments}/${attachmentId}`, {
    method: "GET",
    image: true,
  });
}

function jsonError(status: number, code: string, message: string): Response {
  return Response.json(
    { success: false, status, error: { code, message } },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

function copyBytes(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

function sessionToken(session: unknown): string | null {
  if (!session || typeof session !== "object" || !("token" in session)) return null;
  const token = session.token;
  return typeof token === "string" && token !== "" ? token : null;
}

async function forward(path: string, options: ForwardOptions): Promise<Response> {
  if (!path.startsWith("/api/v1/platform-support")) {
    return jsonError(404, "platform_support.not_found", "Image not found.");
  }

  const token = sessionToken(await auth());
  if (!token) return jsonError(401, "unauthenticated", "Unauthenticated.");

  const apiBase = process.env.NEXTAPI_URL;
  if (!apiBase) return jsonError(500, "platform_support.invalid", "API is not configured.");

  const headers: Record<string, string> = {
    Accept: options.image ? "image/*, application/json" : "application/json",
    Authorization: `Bearer ${token}`,
    "X-Requested-With": "XMLHttpRequest",
  };
  if (options.contentType) headers["Content-Type"] = options.contentType;

  const upstream = await fetch(`${apiBase}${path}`, {
    method: options.method,
    headers,
    body: options.body ? copyBytes(options.body) : undefined,
    cache: "no-store",
  });

  return relay(upstream, options.image === true);
}

async function relay(upstream: Response, image: boolean): Promise<Response> {
  const headers = new Headers();
  headers.set("Cache-Control", "private, no-store");
  const retryAfter = upstream.headers.get("retry-after");
  if (retryAfter) headers.set("Retry-After", retryAfter);

  if (image && upstream.ok) {
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return jsonError(404, "platform_support.not_found", "Image not found.");
    }
    headers.set("Content-Type", contentType);
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(upstream.body, { status: upstream.status, headers });
  }

  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  return new Response(upstream.body, { status: upstream.status, headers });
}

export const PRIVATE_IMAGE_FIELDS = ["photo", "avatar", "nid_front", "nid_back"] as const;

export const PRIVATE_IMAGE_FIELDS_BY_RESOURCE = {
  clients: ["photo", "nid_front", "nid_back"],
  staffs: ["photo", "nid_front", "nid_back"],
  resellers: ["avatar", "nid_front", "nid_back"],
} as const;

export type PrivateImageFieldName = (typeof PRIVATE_IMAGE_FIELDS)[number];
export type PrivateImageResource = keyof typeof PRIVATE_IMAGE_FIELDS_BY_RESOURCE;

export function privateImageFieldAllowed(resource: PrivateImageResource, field: string): boolean {
  return (PRIVATE_IMAGE_FIELDS_BY_RESOURCE[resource] as readonly string[]).includes(field);
}

export const MAX_PRIVATE_IMAGE_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PrivateImageFileError = "invalid_type" | "too_large";

export function privateImageFileError(file: Pick<File, "type" | "size">): PrivateImageFileError | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return "invalid_type";
  if (file.size > MAX_PRIVATE_IMAGE_BYTES) return "too_large";
  return null;
}

export function privateImageSrc(
  resource: string,
  id: string,
  field: PrivateImageFieldName,
  version: string,
): string {
  return `/api/${resource}/${encodeURIComponent(id)}/images/${field}?v=${encodeURIComponent(version)}`;
}

export function storedPrivateImage(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

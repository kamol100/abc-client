import { describe, expect, it } from "vitest";
import {
  MAX_PRIVATE_IMAGE_BYTES,
  privateImageFileError,
  privateImageSrc,
  storedPrivateImage,
} from "@/lib/images/private-image";

describe("privateImageFileError", () => {
  it("accepts jpeg, png, and webp within 2MB", () => {
    expect(privateImageFileError({ type: "image/jpeg", size: 1200 })).toBeNull();
    expect(privateImageFileError({ type: "image/png", size: MAX_PRIVATE_IMAGE_BYTES })).toBeNull();
    expect(privateImageFileError({ type: "image/webp", size: 1 })).toBeNull();
  });

  it("rejects other types and files over 2MB", () => {
    expect(privateImageFileError({ type: "application/pdf", size: 100 })).toBe("invalid_type");
    expect(privateImageFileError({ type: "image/gif", size: 100 })).toBe("invalid_type");
    expect(privateImageFileError({ type: "image/png", size: MAX_PRIVATE_IMAGE_BYTES + 1 })).toBe("too_large");
  });
});

describe("privateImageSrc", () => {
  it("builds a same-origin preview url", () => {
    expect(privateImageSrc("staffs", "abc", "nid_front", "staffs/1/photo.png")).toBe(
      "/api/staffs/abc/images/nid_front?v=staffs%2F1%2Fphoto.png",
    );
  });
});

describe("storedPrivateImage", () => {
  it("keeps a stored path and ignores blanks", () => {
    expect(storedPrivateImage("staffs/1/photo.png")).toBe("staffs/1/photo.png");
    expect(storedPrivateImage("  ")).toBeNull();
    expect(storedPrivateImage(null)).toBeNull();
    expect(storedPrivateImage(undefined)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { isFaviconContentType, sameOriginFaviconUrl } from "@/lib/favicon/site-favicon";

const API = "https://api.example.com";

describe("sameOriginFaviconUrl", () => {
  // সাইটের আইকন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps a favicon stored on the API origin»।
  it("Site favicon: keeps a favicon stored on the API origin", () => {
    expect(sameOriginFaviconUrl(`${API}/storage/favicon.png`, API)).toBe(
      `${API}/storage/favicon.png`,
    );
  });

  // সাইটের আইকন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «drops a favicon that points somewhere else»।
  it("Site favicon: drops a favicon that points somewhere else", () => {
    expect(sameOriginFaviconUrl("https://cdn.example.com/favicon.png", API)).toBeNull();
    expect(sameOriginFaviconUrl("https://evil.example/api.example.com/favicon.png", API)).toBeNull();
    expect(sameOriginFaviconUrl("", API)).toBeNull();
    expect(sameOriginFaviconUrl(`${API}/favicon.png`, "")).toBeNull();
  });
});

describe("isFaviconContentType", () => {
  // সাইটের আইকন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «accepts image types used for site icons»।
  it("Site favicon: accepts image types used for site icons", () => {
    expect(isFaviconContentType("image/png")).toBe(true);
    expect(isFaviconContentType("image/png; charset=binary")).toBe(true);
    expect(isFaviconContentType("image/x-icon")).toBe(true);
    expect(isFaviconContentType("text/html")).toBe(false);
    expect(isFaviconContentType(null)).toBe(false);
  });
});

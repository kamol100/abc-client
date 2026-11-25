import { describe, expect, it } from "vitest";
import { isBdMobile, normalizeBdMobile, optionalBdMobile, requiredBdMobile } from "@/lib/phone";

describe("normalizeBdMobile", () => {
  it.each([
    "01712345678",
    "8801712345678",
    "+8801712345678",
    "+880 1712-345678",
    "88001712345678",
    "008801712345678",
    "1712345678",
    " 017.1234 5678 ",
  ])("turns %s into 01712345678", (typed) => {
    expect(normalizeBdMobile(typed)).toBe("01712345678");
  });

  it.each(["013", "014", "015", "016", "017", "018", "019"])("accepts the %s prefix", (prefix) => {
    expect(isBdMobile(`${prefix}12345678`)).toBe(true);
  });

  it.each(["01212345678", "02-9551234", "09600 000000", "0171234567", "+14155552671", "abc"])(
    "leaves %s for validation to reject",
    (typed) => {
      const normalized = normalizeBdMobile(typed);
      expect(normalized).toBe(typed.trim());
      expect(isBdMobile(normalized)).toBe(false);
    },
  );

  it("turns blank into null", () => {
    expect(normalizeBdMobile("  ")).toBeNull();
    expect(normalizeBdMobile(undefined)).toBeNull();
  });
});

describe("zod phone rules", () => {
  const required = requiredBdMobile("required");
  const optional = optionalBdMobile();

  it("saves a number typed with a country code in the local form", () => {
    expect(required.parse("+880 1712-345678")).toBe("01712345678");
    expect(optional.parse("8801812345678")).toBe("01812345678");
  });

  it("rejects blank and non-mobile numbers when required", () => {
    expect(required.safeParse("").error?.issues[0]?.message).toBe("required");
    expect(required.safeParse(null).error?.issues[0]?.message).toBe("required");
    expect(required.safeParse("01212345678").error?.issues[0]?.message).toBe("common.phone_bd_mobile_invalid");
  });

  it("sends a blank optional number as null", () => {
    expect(optional.parse("")).toBeNull();
    expect(optional.parse(null)).toBeNull();
    expect(optional.safeParse("029551234").success).toBe(false);
  });
});

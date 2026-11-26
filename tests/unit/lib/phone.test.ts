import { describe, expect, it } from "vitest";
import { isBdMobile, normalizeBdMobile, optionalBdMobile, requiredBdMobile } from "@/lib/phone";

describe("normalizeBdMobile", () => {
  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «turns %s into 01712345678»।
  it.each([
    "01712345678",
    "8801712345678",
    "+8801712345678",
    "+880 1712-345678",
    "88001712345678",
    "008801712345678",
    "1712345678",
    " 017.1234 5678 ",
  ])("Bangladesh mobile numbers: turns %s into 01712345678", (typed) => {
    expect(normalizeBdMobile(typed)).toBe("01712345678");
  });

  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «accepts the %s prefix»।
  it.each(["013", "014", "015", "016", "017", "018", "019"])("Bangladesh mobile numbers: accepts the %s prefix", (prefix) => {
    expect(isBdMobile(`${prefix}12345678`)).toBe(true);
  });

  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves %s for validation to reject»।
  it.each(["01212345678", "02-9551234", "09600 000000", "0171234567", "+14155552671", "abc"])(
    "Bangladesh mobile numbers: leaves %s for validation to reject",
    (typed) => {
      const normalized = normalizeBdMobile(typed);
      expect(normalized).toBe(typed.trim());
      expect(isBdMobile(normalized)).toBe(false);
    },
  );

  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «turns blank into null»।
  it("Bangladesh mobile numbers: turns blank into null", () => {
    expect(normalizeBdMobile("  ")).toBeNull();
    expect(normalizeBdMobile(undefined)).toBeNull();
  });
});

describe("zod phone rules", () => {
  const required = requiredBdMobile("required");
  const optional = optionalBdMobile();

  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «saves a number typed with a country code in the local form»।
  it("Bangladesh mobile numbers: saves a number typed with a country code in the local form", () => {
    expect(required.parse("+880 1712-345678")).toBe("01712345678");
    expect(optional.parse("8801812345678")).toBe("01812345678");
  });

  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «rejects blank and non-mobile numbers when required»।
  it("Bangladesh mobile numbers: rejects blank and non-mobile numbers when required", () => {
    expect(required.safeParse("").error?.issues[0]?.message).toBe("required");
    expect(required.safeParse(null).error?.issues[0]?.message).toBe("required");
    expect(required.safeParse("01212345678").error?.issues[0]?.message).toBe("common.phone_bd_mobile_invalid");
  });

  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends a blank optional number as null»।
  it("Bangladesh mobile numbers: sends a blank optional number as null", () => {
    expect(optional.parse("")).toBeNull();
    expect(optional.parse(null)).toBeNull();
    expect(optional.safeParse("029551234").success).toBe(false);
  });
});

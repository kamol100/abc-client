import { describe, expect, it } from "vitest";
import { keepIfSame } from "@/lib/helper/keep-if-same";

describe("keepIfSame", () => {
  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the current object when the refetched one has the same content»।
  it("Unchanged query data: keeps the current object when the refetched one has the same content", () => {
    const current = { company: "VP", roles: ["Admin"] };
    expect(keepIfSame({ company: "VP", roles: ["Admin"] })(current)).toBe(current);
  });

  // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «takes the new value when anything changed»।
  it("Unchanged query data: takes the new value when anything changed", () => {
    const next = { company: "VP", roles: ["Admin", "Manager"] };
    expect(keepIfSame(next)({ company: "VP", roles: ["Admin"] })).toBe(next);
    expect(keepIfSame<string[] | null>(null)(["a"])).toBeNull();
  });
});

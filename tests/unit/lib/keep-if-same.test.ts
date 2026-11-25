import { describe, expect, it } from "vitest";
import { keepIfSame } from "@/lib/helper/keep-if-same";

describe("keepIfSame", () => {
  it("keeps the current object when the refetched one has the same content", () => {
    const current = { company: "VP", roles: ["Admin"] };
    expect(keepIfSame({ company: "VP", roles: ["Admin"] })(current)).toBe(current);
  });

  it("takes the new value when anything changed", () => {
    const next = { company: "VP", roles: ["Admin", "Manager"] };
    expect(keepIfSame(next)({ company: "VP", roles: ["Admin"] })).toBe(next);
    expect(keepIfSame<string[] | null>(null)(["a"])).toBeNull();
  });
});

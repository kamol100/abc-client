import { describe, expect, it } from "vitest";
import { packageOptionLabel } from "@/components/packages/package-option-label";

describe("packageOptionLabel", () => {
  // প্যাকেজের ড্রপডাউনে নামের সাথে স্পিড ও দাম দেখানো হচ্ছে কিনা যাচাই করি।
  it("Package option label: shows the name with the speed and the price", () => {
    expect(packageOptionLabel({ id: 1, name: "Home 10", bandwidth: "10 Mbps", price: 1500 })).toBe(
      "Home 10 — 10 Mbps · ৳1,500",
    );
  });

  // স্পিড না থাকলে শুধু নাম ও দাম দেখানো হচ্ছে কিনা যাচাই করি।
  it("Package option label: leaves out the speed when the package has none", () => {
    expect(packageOptionLabel({ id: 1, name: "Home 10", bandwidth: null, price: 500 })).toBe(
      "Home 10 — ৳500",
    );
  });

  // API শুধু নাম পাঠালে লেবেলে শুধু নামই থাকছে কিনা যাচাই করি।
  it("Package option label: shows only the name when the record has no speed or price", () => {
    expect(packageOptionLabel({ id: 1, name: "Home 10" })).toBe("Home 10");
  });

  // নাম না থাকলে null ফেরত দিয়ে ডিফল্ট লেবেলে ফিরে যাচ্ছে কিনা যাচাই করি।
  it("Package option label: returns null when the record has no name", () => {
    expect(packageOptionLabel({ id: 1, price: 500 })).toBeNull();
  });
});

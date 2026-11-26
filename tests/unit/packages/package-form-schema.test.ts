import { describe, expect, it } from "vitest";
import { PackageFormFieldSchema } from "@/components/packages/package-form-schema";

describe("PackageFormFieldSchema", () => {
  // প্যাকেজের তথ্য যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves every field editable by default»।
  it("Package form schema: leaves every field editable by default", () => {
    const fields = PackageFormFieldSchema();

    expect(fields.find((field) => field.type === "number")?.name).toBe("price");
    expect(fields.every((field) => !field.disabled)).toBe(true);
  });

  // প্যাকেজের তথ্য যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «disables every field except price for a locked client package»।
  it("Package form schema: disables every field except price for a locked client package", () => {
    const fields = PackageFormFieldSchema({ lockExceptPrice: true });
    const price = fields.find((field) => field.name === "price");
    const locked = fields.filter((field) => field.name !== "price");

    expect(price?.disabled).toBeFalsy();
    expect(locked.every((field) => field.disabled)).toBe(true);
  });

  // প্যাকেজের তথ্য যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps buying_price editable for a locked reseller package»।
  it("Package form schema: keeps buying_price editable for a locked reseller package", () => {
    const fields = PackageFormFieldSchema({
      packageType: "reseller",
      lockExceptPrice: true,
    });
    const price = fields.find((field) => field.name === "buying_price");
    const locked = fields.filter((field) => field.name !== "buying_price");

    expect(price?.disabled).toBeFalsy();
    expect(locked.every((field) => field.disabled)).toBe(true);
  });
});

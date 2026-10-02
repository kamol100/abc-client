import { describe, expect, it } from "vitest";
import { PackageFormFieldSchema } from "@/components/packages/package-form-schema";

describe("PackageFormFieldSchema", () => {
  it("leaves every field editable by default", () => {
    const fields = PackageFormFieldSchema();

    expect(fields.find((field) => field.type === "number")?.name).toBe("price");
    expect(fields.every((field) => !field.disabled)).toBe(true);
  });

  it("disables every field except price for a locked client package", () => {
    const fields = PackageFormFieldSchema({ lockExceptPrice: true });
    const price = fields.find((field) => field.name === "price");
    const locked = fields.filter((field) => field.name !== "price");

    expect(price?.disabled).toBeFalsy();
    expect(locked.every((field) => field.disabled)).toBe(true);
  });

  it("keeps buying_price editable for a locked reseller package", () => {
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

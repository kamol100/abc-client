import { describe, expect, it } from "vitest";
import FeatureFormFieldSchema from "@/components/subscription/feature-form-schema";
import { FeatureCreateSchema, FeatureFormSchema } from "@/components/subscription/feature-type";

describe("feature form", () => {
  // সাবস্ক্রিপশন, প্ল্যান ও ফিচার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «requires a lowercase key when creating a feature»।
  it("Subscription feature form: requires a lowercase key when creating a feature", () => {
    expect(FeatureCreateSchema.safeParse({ name: "Inventory" }).success).toBe(false);
    expect(FeatureCreateSchema.safeParse({ key: "Inventory", name: "Inventory" }).success).toBe(false);

    const parsed = FeatureCreateSchema.parse({
      key: "inventory",
      name: "Inventory",
    });

    expect(parsed.key).toBe("inventory");
    expect(parsed.name).toBe("Inventory");
    expect(parsed.sort_order).toBe(0);
  });

  // সাবস্ক্রিপশন, প্ল্যান ও ফিচার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «updates name and description without a key»।
  it("Subscription feature form: updates name and description without a key", () => {
    const parsed = FeatureFormSchema.parse({
      name: "Stock",
      description: "Updated",
      sort_order: "8",
    });

    expect(parsed).toEqual({
      name: "Stock",
      description: "Updated",
      sort_order: 8,
    });
  });

  // সাবস্ক্রিপশন, প্ল্যান ও ফিচার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the key field only when creating»।
  it("Subscription feature form: shows the key field only when creating", () => {
    const createKey = FeatureFormFieldSchema("create").find((field) => field.name === "key");
    const editKey = FeatureFormFieldSchema("edit").find((field) => field.name === "key");

    expect(createKey?.permission).toBe(true);
    expect(editKey?.permission).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import FeatureFormFieldSchema from "@/components/subscription/feature-form-schema";
import { FeatureCreateSchema, FeatureFormSchema } from "@/components/subscription/feature-type";

describe("feature form", () => {
  it("requires a lowercase key when creating a feature", () => {
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

  it("updates name and description without a key", () => {
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

  it("shows the key field only when creating", () => {
    const createKey = FeatureFormFieldSchema("create").find((field) => field.name === "key");
    const editKey = FeatureFormFieldSchema("edit").find((field) => field.name === "key");

    expect(createKey?.permission).toBe(true);
    expect(editKey?.permission).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { normalizeFieldArrayItems } from "@/components/form-wrapper/form-field-defaults";

// The API saves a row as { label, value }; the form edits it under these names.
const salaryItemFields: FieldConfig[] = [
  { type: "text", name: "items_label", valueKey: "label" },
  { type: "number", name: "items_value", valueKey: "value" },
];

const deductionFields: FieldConfig[] = [
  { type: "text", name: "deductions_label", valueKey: "label" },
  { type: "number", name: "deductions_value", valueKey: "value" },
];

describe("normalizeFieldArrayItems", () => {
  // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «drops salary rows that only have an empty label and value»।
  it("Field array items: drops salary rows that only have an empty label and value", () => {
    const items = normalizeFieldArrayItems(
      [
        { items_label: "", items_value: 0 },
        { label: "", value: "" },
        { items_label: "Basic", items_value: 1000 },
      ],
      salaryItemFields,
      { omitBlank: true },
    );

    expect(items).toEqual([{ items_label: "Basic", items_value: 1000 }]);
  });

  // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «drops blank deductions and keeps a labeled amount»।
  it("Field array items: drops blank deductions and keeps a labeled amount", () => {
    const items = normalizeFieldArrayItems(
      [
        { deductions_label: "", deductions_value: 0 },
        { deductions_label: "Tax", deductions_value: 150 },
      ],
      deductionFields,
      { omitBlank: true },
    );

    expect(items).toEqual([{ deductions_label: "Tax", deductions_value: 150 }]);
  });

  // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «maps a filled label and value onto the salary item fields»।
  it("Field array items: maps a filled label and value onto the salary item fields", () => {
    const items = normalizeFieldArrayItems(
      [{ label: "Allowance", value: 200 }],
      salaryItemFields,
      { omitBlank: true },
    );

    expect(items).toEqual([
      { label: "Allowance", value: 200, items_label: "Allowance", items_value: 200 },
    ]);
  });
});

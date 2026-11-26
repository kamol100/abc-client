import { describe, expect, it, vi } from "vitest";
import StaffFormSchema, { staffImageFields } from "@/components/staffs/staff-form-schema";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

describe("StaffFormSchema", () => {
  // স্টাফের তথ্য ও অ্যাকাউন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «puts photo and nid uploads in the advance section»।
  it("Staff form schema: puts photo and nid uploads in the advance section", () => {
    const sections = StaffFormSchema({});
    const advance = sections.find((section) => section.name === "common.advance_information");
    const names = sections.flatMap((section) => section.form.map((field) => field.name));

    expect(advance?.form).toEqual([
      {
        type: "slot",
        name: "staff_images",
        slot: "staff_images",
        className: "col-span-full",
      },
    ]);
    expect(staffImageFields.map((field) => field.name)).toEqual(["photo", "nid_front", "nid_back"]);
    expect(names).not.toContain("nid");
  });

  // স্টাফের তথ্য ও অ্যাকাউন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «assigns zones from the basic section»।
  it("Staff form schema: assigns zones from the basic section", () => {
    const sections = StaffFormSchema({});
    const basic = sections.find((section) => section.name === "common.basic_information");
    const zones = basic?.form.find((field) => field.name === "zone_ids");

    expect(zones).toMatchObject({
      type: "dropdown",
      name: "zone_ids",
      label: { labelText: "staff.zones.label" },
      placeholder: "staff.zones.placeholder",
      api: "/dropdown-zones",
      isMulti: true,
      valueMapping: { idKey: "id", labelKey: "name" },
      valueKey: "zones",
    });
  });

  // স্টাফের তথ্য ও অ্যাকাউন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not require an empty salary row»।
  it("Staff form schema: does not require an empty salary row", () => {
    const sections = StaffFormSchema({});
    const salary = sections.find((section) => section.name === "common.salary_information");
    const arrays = salary?.form.filter((field) => field.type === "fieldArray") ?? [];

    expect(arrays.map((field) => field.name)).toEqual(["salary_items", "salary_deductions"]);
    for (const field of arrays) {
      if (field.type !== "fieldArray") continue;
      expect(field.minItems).toBe(0);
      expect(field.omitBlankItems).toBe(true);
    }
  });
});

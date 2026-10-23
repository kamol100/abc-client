import { describe, expect, it, vi } from "vitest";
import StaffFormSchema, { staffImageFields } from "@/components/staffs/staff-form-schema";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

describe("StaffFormSchema", () => {
  it("puts photo and nid uploads in the advance section", () => {
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
});

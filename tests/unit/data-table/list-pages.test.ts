import { describe, expect, it } from "vitest";
import en from "@/public/lang/en.json";
import bn from "@/public/lang/bn.json";
import {
  LIST_PAGES,
  LIST_PAGE_IDS,
  filterPositionKey,
  toFilterPosition,
} from "@/components/data-table/toolbar/list-pages";
import { readSetting } from "@/components/settings/core/values";
import { settingLabelKey } from "@/components/settings/registry/fields";
import { FILTER_POSITION_OPTIONS } from "@/components/settings/registry/options";

function lookup(dict: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>(
    (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
    dict,
  );
}

describe("list pages", () => {
  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads 'below' and treats anything else as inline»।
  it("List pages: reads 'below' and treats anything else as inline", () => {
    expect(toFilterPosition("below")).toBe("below");
    for (const raw of ["inline", undefined, null, "", "BELOW", 1]) expect(toFilterPosition(raw)).toBe("inline");
    expect(readSetting(filterPositionKey("invoices"), "below")).toBe("below");
    expect(readSetting(filterPositionKey("invoices"), "sideways")).toBe("inline");
  });

  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «has every %s translation the ⚙ dialogs need»।
  it.each([
    ["en", en],
    ["bn", bn],
  ])("List pages: has every %s translation the ⚙ dialogs need", (_lang, dict) => {
    const keys = [
      ...LIST_PAGE_IDS.map((page) => LIST_PAGES[page]),
      settingLabelKey(filterPositionKey("invoices")),
      "settings.fields.filter_position.description",
      "settings.groups.filter",
      "settings.sections.list_page.description",
      ...FILTER_POSITION_OPTIONS.map((option) => option.label),
    ];
    expect(keys.filter((key) => typeof lookup(dict, key) !== "string")).toEqual([]);
  });
});

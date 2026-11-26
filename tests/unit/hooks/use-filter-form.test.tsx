import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { useFilterForm } from "@/hooks/use-filter-form";
import MikrotikSyncFilterSchema, {
  MIKROTIK_SYNC_DEFAULT_FILTER,
} from "@/components/mikrotik-sync/mikrotik-sync-filter-schema";

const schema: FieldConfig[] = [
  {
    type: "dropdown",
    name: "syncd_status",
    options: [
      { value: "all", label: "all" },
      { value: "null", label: "not imported" },
    ],
  },
];

describe("useFilterForm defaults", () => {
  // ফিল্টারের অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «starts with the default values and resets back to them»।
  it("Use filter form: starts with the default values and resets back to them", () => {
    const setFilter = vi.fn();
    const { result } = renderHook(() =>
      useFilterForm({ formSchema: schema, setFilter, defaultValues: { syncd_status: "null" } }),
    );

    expect(result.current.form.getValues("syncd_status")).toBe("null");

    act(() => result.current.form.setValue("syncd_status", "all"));
    act(() => result.current.resetFilter());

    expect(result.current.form.getValues("syncd_status")).toBe("null");
    expect(setFilter).toHaveBeenLastCalledWith("syncd_status=null");
  });

  // ফিল্টারের অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «resets to an empty query without defaults»।
  it("Use filter form: resets to an empty query without defaults", () => {
    const setFilter = vi.fn();
    const { result } = renderHook(() => useFilterForm({ formSchema: schema, setFilter }));

    act(() => result.current.resetFilter());

    expect(setFilter).toHaveBeenLastCalledWith("");
  });
});

describe("MikrotikSyncFilterSchema", () => {
  // ফিল্টারের অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «offers all, imported and not imported, defaulting to not imported»।
  it("Use filter form: offers all, imported and not imported, defaulting to not imported", () => {
    const field = MikrotikSyncFilterSchema().find((f) => f.name === "syncd_status");
    const values = field && "options" in field ? field.options?.map((o) => o.value) : [];

    expect(values).toEqual(["all", "imported", "null"]);
    expect(MIKROTIK_SYNC_DEFAULT_FILTER).toEqual({ syncd_status: "null" });
  });
});

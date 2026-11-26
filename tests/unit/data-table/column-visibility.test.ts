import { describe, expect, it } from "vitest";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import {
  collectColumnIds,
  columnVisibilityStorageKey,
  mergeColumnVisibility,
  readStoredColumnVisibility,
  sanitizeColumnVisibility,
  tableColumnVisibilityId,
  writeStoredColumnVisibility,
} from "@/components/data-table/column-visibility";

interface Row {
  name: string;
  email: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { id: "actions", header: "Actions", cell: () => null, enableHiding: false },
];

describe("column visibility storage", () => {
  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «builds a page and table specific key»।
  it("Column visibility: builds a page and table specific key", () => {
    expect(columnVisibilityStorageKey("/clients", "clients")).toBe(
      "data-table:column-visibility:/clients:clients",
    );
    expect(columnVisibilityStorageKey("/invoices", "clients")).not.toBe(
      columnVisibilityStorageKey("/clients", "clients"),
    );
    expect(columnVisibilityStorageKey("/clients", "reseller-clients")).not.toBe(
      columnVisibilityStorageKey("/clients", "clients"),
    );
    expect(columnVisibilityStorageKey("  ", "clients")).toBe(
      "data-table:column-visibility:unknown:clients",
    );
  });

  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «uses the query key, then column ids, as the table id»।
  it("Column visibility: uses the query key, then column ids, as the table id", () => {
    expect(tableColumnVisibilityId("clients", ["email", "name"])).toBe("clients");
    expect(tableColumnVisibilityId("  ", ["email", "name"])).toBe("email,name");
    expect(tableColumnVisibilityId(undefined, [])).toBe("default");
  });

  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «collects only columns the toggle can hide»।
  it("Column visibility: collects only columns the toggle can hide", () => {
    expect(collectColumnIds(columns)).toEqual(["name", "email"]);
    expect(
      collectColumnIds<Row, unknown>([
        { id: "onu_name", accessorFn: (row) => row.name, header: "ONU" },
      ]),
    ).toEqual(["onu_name"]);
  });

  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps defaults when storage is missing, invalid, or outdated»।
  it("Column visibility: keeps defaults when storage is missing, invalid, or outdated", () => {
    const defaults: VisibilityState = { email: false };
    const allowed = new Set(["name", "email"]);

    expect(mergeColumnVisibility(defaults, null, allowed)).toEqual({ email: false });
    expect(mergeColumnVisibility(defaults, [], allowed)).toEqual({ email: false });
    expect(mergeColumnVisibility(defaults, "nope", allowed)).toEqual({ email: false });
    expect(
      mergeColumnVisibility(defaults, { removed: false, name: "hidden", email: true }, allowed),
    ).toEqual({ email: true });
  });

  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «lets a saved choice override the default visibility»।
  it("Column visibility: lets a saved choice override the default visibility", () => {
    const allowed = new Set(["name", "email"]);

    expect(mergeColumnVisibility({ email: false }, { email: true }, allowed)).toEqual({
      email: true,
    });
    expect(mergeColumnVisibility({}, { name: false }, allowed)).toEqual({ name: false });
  });

  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «drops columns that cannot be toggled before writing»।
  it("Column visibility: drops columns that cannot be toggled before writing", () => {
    expect(
      sanitizeColumnVisibility({ email: false, actions: false, name: true }, new Set(["name", "email"])),
    ).toEqual({ email: false, name: true });
  });

  // তালিকার সারি, ফিল্টার ও পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «removes corrupt storage and keeps a partial record»।
  it("Column visibility: removes corrupt storage and keeps a partial record", () => {
    const key = columnVisibilityStorageKey("/clients", "clients");
    localStorage.setItem(key, "{");

    expect(readStoredColumnVisibility(key)).toBeNull();
    expect(localStorage.getItem(key)).toBeNull();

    localStorage.setItem(key, JSON.stringify({ email: false, name: "hidden" }));
    expect(readStoredColumnVisibility(key)).toEqual({ email: false, name: "hidden" });
  });
});

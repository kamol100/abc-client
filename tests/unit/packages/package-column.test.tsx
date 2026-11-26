import { renderHook } from "@testing-library/react";
import { ColumnDef } from "@tanstack/react-table";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePackageColumns } from "@/components/packages/package-column";
import { PackageRow } from "@/components/packages/package-type";

const { profileState } = vi.hoisted(() => ({
  profileState: {
    reseller: null as { uuid: string; name: string } | null,
  },
}));

vi.mock("@/context/app-provider", () => ({
  useProfile: () => ({ profile: profileState }),
}));

vi.mock("@/components/packages/package-row-actions", () => ({
  default: () => null,
}));

const accessorKeys = (columns: ColumnDef<PackageRow>[]) =>
  columns.flatMap((column) =>
    "accessorKey" in column && column.accessorKey
      ? [String(column.accessorKey)]
      : []
  );

describe("usePackageColumns", () => {
  beforeEach(() => {
    profileState.reseller = null;
  });

  // প্যাকেজের তথ্য যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides buying_price when the signed-in user is not a reseller»।
  it("Package column: hides buying_price when the signed-in user is not a reseller", () => {
    const { result } = renderHook(() => usePackageColumns("client"));

    expect(accessorKeys(result.current)).not.toContain("buying_price");
    expect(accessorKeys(result.current)).toContain("price");
  });

  // প্যাকেজের তথ্য যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows buying_price when the signed-in user is a reseller»।
  it("Package column: shows buying_price when the signed-in user is a reseller", () => {
    profileState.reseller = { uuid: "reseller-1", name: "North Reseller" };

    const { result } = renderHook(() => usePackageColumns("client"));

    expect(accessorKeys(result.current)).toContain("buying_price");
  });
});

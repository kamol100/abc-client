import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useOnuColumns } from "@/components/onu/onu-column";

// A stable `t`, like react-i18next's.
const i18n = vi.hoisted(() => ({ t: (key: string) => key, i18n: { language: "en" } }));
vi.mock("react-i18next", () => ({ useTranslation: () => i18n }));
vi.mock("@/context/app-provider", () => ({ usePermissions: () => ({ hasPermission: () => true }) }));
vi.mock("@/components/onu/onu-actions-cell", () => ({ default: () => null }));

const ids = (columns: { id?: string }[]) => columns.map((column) => column.id);

describe("useOnuColumns", () => {
    it("lists the ONU columns with one actions column last", () => {
        const { result } = renderHook(() => useOnuColumns({ thresholdDbm: -27 }));
        expect(ids(result.current)).toEqual([
            "onu_name", "onu_olt", "onu_status", "onu_rx", "onu_distance", "onu_client", "onu_last_seen", "actions",
        ]);
    });

    it("drops the OLT column on the OLT page", () => {
        const { result } = renderHook(() => useOnuColumns({ showOlt: false, thresholdDbm: -27 }));
        expect(ids(result.current)).not.toContain("onu_olt");
    });

    it("keeps the same column objects across renders (open row dialogs survive a refetch)", () => {
        const { result, rerender } = renderHook(() => useOnuColumns({ thresholdDbm: -27 }));
        const first = result.current;
        rerender();
        expect(result.current).toBe(first);
    });
});

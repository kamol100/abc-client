import { render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductMovementDeleteAction, {
    PRODUCT_MOVEMENT_INVALIDATE_KEYS,
} from "@/components/products/product-movement-delete-action";
import { useProductReportsColumns } from "@/components/products/product-reports-table";

const permissions = vi.hoisted(() => ({ granted: [] as string[] }));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        permissions: permissions.granted,
        hasPermission: (name: string) => permissions.granted.includes(name),
    }),
}));

vi.mock("@/components/delete-modal", () => ({
    DeleteModal: (props: { api_url: string; keys?: string; confirmMessage?: string }) => (
        <button
            type="button"
            data-testid="delete"
            data-url={props.api_url}
            data-keys={props.keys}
            data-confirm={props.confirmMessage}
        />
    ),
}));

const uuid = "019aac07-0000-7000-8000-000000000010";

describe("PRODUCTS-003 movement delete action", () => {
    beforeEach(() => {
        permissions.granted = [];
    });

    it("deletes a stock-out by uuid and refreshes stock lists and reports", () => {
        permissions.granted = ["products-out.delete"];
        render(<ProductMovementDeleteAction mode="out" id={uuid} />);

        const button = screen.getByTestId("delete");
        expect(button.dataset.url).toBe(`/products-out/${uuid}`);
        expect(button.dataset.keys).toBe(PRODUCT_MOVEMENT_INVALIDATE_KEYS);
        expect(button.dataset.confirm).toBe("product_movement.actions.delete_out_confirmation");
        expect(PRODUCT_MOVEMENT_INVALIDATE_KEYS.split(",")).toEqual(
            expect.arrayContaining(["products", "products-in", "products-out", "products-in-reports", "products-out-reports"]),
        );
    });

    it("deletes a stock-in with its own permission and endpoint", () => {
        permissions.granted = ["products-in.delete"];
        render(<ProductMovementDeleteAction mode="in" id={uuid} />);

        const button = screen.getByTestId("delete");
        expect(button.dataset.url).toBe(`/products-in/${uuid}`);
        expect(button.dataset.confirm).toBe("product_movement.actions.delete_in_confirmation");
    });

    it("hides the button without the matching delete permission", () => {
        permissions.granted = ["products-in.delete"];
        render(<ProductMovementDeleteAction mode="out" id={uuid} />);

        expect(screen.queryByTestId("delete")).toBeNull();
    });

    it("adds an actions column to the stock-in and stock-out report tables", () => {
        for (const mode of ["in", "out"] as const) {
            const { result } = renderHook(() => useProductReportsColumns(mode));
            const ids = result.current.map((column) => column.id ?? ("accessorKey" in column ? column.accessorKey : undefined));
            expect(ids.at(-1)).toBe("actions");
        }
    });
});

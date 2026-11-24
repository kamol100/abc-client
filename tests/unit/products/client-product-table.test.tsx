import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientProductTable from "@/components/products/client-product-table";

const state = vi.hoisted(() => ({
    granted: [] as string[],
    queryArgs: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        permissions: state.granted,
        hasPermission: (name: string) => state.granted.includes(name),
    }),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: (args: Record<string, unknown>) => {
        state.queryArgs.push(args);
        return {
            isLoading: false,
            isFetching: false,
            setCurrentPage: vi.fn(),
            data: {
                data: {
                    data: [{
                        id: "019aac07-0000-7000-8000-000000000020",
                        out_date: "20-Nov-2026",
                        quantity: 1,
                        unit_price: 1500,
                        vat: 5,
                        discount: 75,
                        total_price: 1500,
                        product: { id: 1, name: "Huawei ONU", product_code: "PRO7" },
                        receivedBy: { id: 2, name: "Rafi" },
                        invoice: { uuid: "019aac07-0000-7000-8000-000000000021", trackID: "INV-0042" },
                        serial: [],
                    }],
                    pagination: { total: 1, count: 1, per_page: 10, current_page: 1, total_pages: 1 },
                    reports: { quantity: 1, total_price: 1500 },
                },
            },
        };
    },
}));

// Render each column's cell for each row; the real DataTable needs the layout providers.
vi.mock("@/components/data-table/data-table", () => ({
    DataTable: ({ data, columns }: {
        data: Array<Record<string, unknown>>;
        columns: Array<{ id?: string; cell?: (ctx: { row: { original: Record<string, unknown> } }) => React.ReactNode }>;
    }) => (
        <div>
            {data.map((original, rowIndex) => (
                <div key={rowIndex}>
                    {columns.map((column) => (
                        <div key={column.id}>{column.cell?.({ row: { original } })}</div>
                    ))}
                </div>
            ))}
        </div>
    ),
}));

vi.mock("@/components/delete-modal", () => ({
    DeleteModal: (props: { api_url: string }) => <button type="button" data-testid="delete" data-url={props.api_url} />,
}));

const clientUuid = "019aac07-0000-7000-8000-0000000000aa";

describe("PRODUCTS-004 client products section", () => {
    beforeEach(() => {
        state.granted = [];
        state.queryArgs = [];
    });

    it("loads stock-outs for this client and shows product, invoice and receiver", () => {
        state.granted = ["products-out.report"];
        render(<ClientProductTable clientUuid={clientUuid} />);

        const args = state.queryArgs.at(-1);
        expect(args?.url).toBe("products-out/reports");
        expect(args?.params).toEqual({ client_uuid: clientUuid });
        expect(args?.enabled).toBe(true);
        expect(args?.queryKey).toEqual(["products-out-reports", "client", clientUuid]);

        expect(screen.getByText("Huawei ONU")).toBeTruthy();
        expect(screen.getByText("PRO7")).toBeTruthy();
        expect(screen.getByText("INV-0042")).toBeTruthy();
        expect(screen.getByText("Rafi")).toBeTruthy();
        expect(screen.queryByTestId("delete")).toBeNull();
    });

    it("shows delete for staff who can delete stock-outs", () => {
        state.granted = ["products-out.report", "products-out.delete"];
        render(<ClientProductTable clientUuid={clientUuid} />);

        expect(screen.getByTestId("delete").dataset.url).toBe("/products-out/019aac07-0000-7000-8000-000000000020");
    });

    it("renders nothing and does not fetch without products-out.report", () => {
        const { container } = render(<ClientProductTable clientUuid={clientUuid} />);

        expect(container.innerHTML).toBe("");
        expect(state.queryArgs.at(-1)?.enabled).toBe(false);
    });
});

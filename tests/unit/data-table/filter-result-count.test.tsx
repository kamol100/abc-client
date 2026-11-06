import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/data-table/data-table";
import FormFilter from "@/components/form-wrapper/form-filter";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TableLayoutProvider } from "@/context/table-layout-provider";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("next/navigation", () => ({
    usePathname: () => "/clients",
}));

vi.mock("@/components/ui/sidebar", () => ({
    useSidebar: () => ({ isMobile: false }),
}));

vi.mock("@/components/change-pagination", () => ({
    default: () => null,
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => ({
        data: undefined,
        isSuccess: false,
        isLoading: false,
        isFetching: false,
        isError: false,
    }),
}));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(),
}));

vi.mock("@/auth/auth", () => ({
    auth: vi.fn(),
}));

const fields: FieldConfig[] = [
    { type: "text", name: "any", placeholder: "search.placeholder" },
];

const columns: ColumnDef<{ name: string }>[] = [{ accessorKey: "name", header: "Name" }];

function filterButton(): HTMLElement {
    const icon = document.querySelector(".lucide-funnel");
    const button = icon?.closest("button");
    if (!button) throw new Error("Missing filter button");
    return button;
}

describe("filter result count", () => {
    it("shows the count at the start of an open filter and hides it when closed", async () => {
        const user = userEvent.setup();
        render(<FormFilter formSchema={fields} resultCount={1284} />);

        expect(screen.queryByTestId("filter-result-count")).not.toBeInTheDocument();

        await user.click(filterButton());

        const count = screen.getByTestId("filter-result-count");
        expect(count).toHaveTextContent("1,284");
        expect(count).toHaveTextContent("common.results");
        const field = screen.getByPlaceholderText("search.placeholder");
        expect(count.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

        await user.click(filterButton());
        expect(screen.queryByTestId("filter-result-count")).not.toBeInTheDocument();
    });

    it("shows zero and stays with a pinned-open filter", () => {
        render(<FormFilter formSchema={fields} resultCount={0} forceOpen hideTrigger />);
        expect(screen.getByTestId("filter-result-count")).toHaveTextContent("0");
    });

    it("passes the list total from any data table into the open filter", async () => {
        const user = userEvent.setup();
        render(
            <TableLayoutProvider>
                <DataTable
                    columns={columns}
                    data={[]}
                    pagination={{ count: 40, current_page: 1, per_page: 40, total: 902, total_pages: 23 }}
                    toolbarOptions={{ filter: fields }}
                />
            </TableLayoutProvider>,
        );

        expect(screen.queryByTestId("filter-result-count")).not.toBeInTheDocument();
        await user.click(filterButton());
        expect(screen.getByTestId("filter-result-count")).toHaveTextContent("902");
    });
});

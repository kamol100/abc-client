import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ClientTable from "@/components/clients/client-table";

const queryCalls = vi.hoisted(() => [] as Array<{ url: string; queryKey: unknown[]; params?: Record<string, string> }>);
const routerReplace = vi.hoisted(() => vi.fn());
const searchParamsState = vi.hoisted(() => ({ value: "" }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: routerReplace }),
    useSearchParams: () => new URLSearchParams(searchParamsState.value),
}));

vi.mock("@/components/ui/sidebar", () => ({
    useSidebar: () => ({ isMobile: false }),
}));

vi.mock("@/components/clients/client-column", () => ({
    useClientColumns: () => [],
}));

vi.mock("next/dynamic", () => ({
    default: () => () => null,
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: (options: { url: string; queryKey: unknown[]; params?: Record<string, string> }) => {
        queryCalls.push({ url: options.url, queryKey: options.queryKey, params: options.params });
        return {
            data: { data: { data: [], pagination: { total: 3 } } },
            isLoading: false,
            isFetching: false,
            setCurrentPage: vi.fn(),
        };
    },
}));

vi.mock("@/components/data-table/data-table", () => ({
    DataTable: ({
        toolbarTitle,
        form,
        toolbarOptions,
    }: {
        toolbarTitle?: string;
        form?: () => null;
        toolbarOptions?: { filter?: Array<{ name: string }> };
    }) => (
        <div>
            <span>{toolbarTitle}</span>
            <span>{form ? "has-create" : "report-only"}</span>
            <span>{toolbarOptions?.filter?.map((field) => field.name).join(",")}</span>
        </div>
    ),
}));

describe("ClientTable reseller report", () => {
    afterEach(() => {
        searchParamsState.value = "";
        window.history.replaceState(null, "", "/");
    });

    it("loads reseller clients with the reseller filter and no create action", () => {
        searchParamsState.value = "";
        queryCalls.length = 0;

        render(<ClientTable variant="reseller-clients" />);

        expect(queryCalls[0]).toMatchObject({
            url: "resellers/clients",
            queryKey: ["reseller-clients"],
        });
        expect(screen.getByText("menu.reports.reseller_clients.title (3)")).toBeInTheDocument();
        expect(screen.getByText("report-only")).toBeInTheDocument();
        expect(screen.getByText("any,network_id,zone_id,status,reseller_id")).toBeInTheDocument();
        expect(queryCalls[0]?.params).toBeUndefined();
    });

    it("sends this month from the browser url when the page prop is missing", () => {
        searchParamsState.value = "";
        window.history.replaceState(null, "", "/reports/reseller-clients?created_at=this_month");
        queryCalls.length = 0;

        render(<ClientTable variant="reseller-clients" />);

        expect(queryCalls.at(-1)).toMatchObject({
            url: "resellers/clients",
            params: { created_at: "this_month" },
        });
        expect(screen.getByText("client.new_this_month.notice")).toBeInTheDocument();
    });

    it("requests this month's reseller clients and clears the filter", async () => {
        searchParamsState.value = "created_at=this_month";
        window.history.replaceState(null, "", "/reports/reseller-clients?created_at=this_month");
        queryCalls.length = 0;
        routerReplace.mockClear();

        const user = userEvent.setup();

        render(<ClientTable variant="reseller-clients" createdAt="this_month" />);

        expect(queryCalls[0]).toMatchObject({
            url: "resellers/clients",
            params: { created_at: "this_month" },
        });
        expect(screen.getByText("client.new_this_month.notice")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "client.new_this_month.show_all" }));
        expect(routerReplace).toHaveBeenCalledWith("/reports/reseller-clients");
    });

    it("keeps the company client list on the default table", () => {
        searchParamsState.value = "";
        queryCalls.length = 0;

        render(<ClientTable />);

        expect(queryCalls[0]).toMatchObject({
            url: "clients",
            queryKey: ["clients"],
        });
        expect(screen.getByText("client.title_plural (3)")).toBeInTheDocument();
        expect(screen.getByText("has-create")).toBeInTheDocument();
        expect(screen.getByText("any,network_id,zone_id,status")).toBeInTheDocument();
    });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ClientTable from "@/components/clients/client-table";

const queryCalls = vi.hoisted(() => [] as Array<{ url: string; queryKey: unknown[] }>);

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: vi.fn() }),
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
    default: (options: { url: string; queryKey: unknown[] }) => {
        queryCalls.push({ url: options.url, queryKey: options.queryKey });
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
    it("loads reseller clients with the reseller filter and no create action", () => {
        queryCalls.length = 0;

        render(<ClientTable variant="reseller-clients" />);

        expect(queryCalls[0]).toMatchObject({
            url: "resellers/clients",
            queryKey: ["reseller-clients"],
        });
        expect(screen.getByText("menu.reports.reseller_clients.title (3)")).toBeInTheDocument();
        expect(screen.getByText("report-only")).toBeInTheDocument();
        expect(screen.getByText("any,network_id,zone_id,status,reseller_id")).toBeInTheDocument();
    });

    it("keeps the company client list on the default table", () => {
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

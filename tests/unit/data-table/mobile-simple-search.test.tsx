import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientFilterSchema from "@/components/clients/client-filter-schema";
import { DataTable } from "@/components/data-table/data-table";
import { TableLayoutProvider } from "@/context/table-layout-provider";

const ANY = "client.any_search.placeholder";

type AccountPhase = "success" | "loading" | "error";

type ObservedQuery = {
    url: string;
    queryKey: unknown;
    pagination?: boolean;
    enabled?: boolean;
};

const queryCalls = vi.hoisted(() => [] as ObservedQuery[]);
const sidebarState = vi.hoisted(() => ({ isMobile: true }));
const accountState = vi.hoisted(() => ({
    phase: "success" as AccountPhase,
    mode: "simple" as "simple" | "default",
    alwaysOpen: false,
    useAccount: false,
    account: null as unknown,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("next/navigation", () => ({
    usePathname: () => "/clients",
    useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/sidebar", () => ({
    useSidebar: () => ({ isMobile: sidebarState.isMobile }),
}));

vi.mock("@/components/change-pagination", () => ({
    default: () => null,
}));

vi.mock("@/components/select-dropdown", () => ({
    default: ({ name, placeholder }: { name: string; placeholder?: string }) => (
        <input aria-label={name} placeholder={placeholder} />
    ),
}));

vi.mock("next/dynamic", async () => {
    const React = await import("react");
    return {
        default: (loader: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>) => {
            const Lazy = React.lazy(loader);
            return function Dynamic(props: Record<string, unknown>) {
                return React.createElement(
                    React.Suspense,
                    { fallback: null },
                    React.createElement(Lazy, props),
                );
            };
        },
    };
});

vi.mock("@/components/my-drawer", async () => {
    const React = await import("react");
    return {
        MyDrawer: ({
            side,
            children,
            trigger,
        }: {
            side?: string;
            children?: React.ReactNode;
            trigger?: React.ReactNode;
        }) =>
            React.createElement(
                "div",
                { "data-testid": "mobile-filter-drawer", "data-side": side },
                trigger,
                children,
            ),
    };
});

vi.mock("@/hooks/use-api-query", () => ({
    default: (options: ObservedQuery) => {
        queryCalls.push(options);
        if (options.url !== "staff-account") {
            return {
                data: undefined,
                isSuccess: false,
                isLoading: false,
                isFetching: false,
                isError: false,
                setCurrentPage: vi.fn(),
            };
        }
        if (accountState.phase === "loading") {
            return {
                data: undefined,
                isSuccess: false,
                isLoading: true,
                isFetching: true,
                isError: false,
                setCurrentPage: vi.fn(),
            };
        }
        if (accountState.phase === "error") {
            return {
                data: undefined,
                isSuccess: false,
                isLoading: false,
                isFetching: false,
                isError: true,
                setCurrentPage: vi.fn(),
            };
        }
        const account = accountState.useAccount
            ? accountState.account
            : {
                settings: {
                    mobile_search: {
                        mode: accountState.mode,
                        always_open: accountState.alwaysOpen,
                    },
                },
            };
        return {
            data: { success: true, data: account },
            isSuccess: true,
            isLoading: false,
            isFetching: false,
            isError: false,
            setCurrentPage: vi.fn(),
        };
    },
}));

const columns: ColumnDef<{ name: string }>[] = [{ accessorKey: "name", header: "Name" }];

function staffAccountQuery(): ObservedQuery | undefined {
    return queryCalls.filter((call) => call.url === "staff-account").at(-1);
}

function renderTable(simpleSearch?: boolean) {
    return render(
        <TableLayoutProvider>
            <DataTable
                columns={columns}
                data={[]}
                toolbarOptions={{ filter: ClientFilterSchema() }}
                setFilter={setFilter}
                {...(simpleSearch === undefined ? {} : { simpleSearch })}
            />
        </TableLayoutProvider>,
    );
}

let setFilter = vi.fn();

function filterButton(): HTMLElement {
    return screen.getByRole("button", { name: "common.filter" });
}

function drawer(): HTMLElement {
    return screen.getByTestId("mobile-filter-drawer");
}

describe("mobile simple search", () => {
    beforeEach(() => {
        sidebarState.isMobile = true;
        accountState.phase = "success";
        accountState.mode = "simple";
        accountState.alwaysOpen = false;
        accountState.useAccount = false;
        accountState.account = null;
        queryCalls.length = 0;
        setFilter = vi.fn();
    });

    it("shows the inline any field only for mobile simple search and toggles it without clearing", async () => {
        const user = userEvent.setup();
        renderTable(true);

        expect(staffAccountQuery()).toMatchObject({
            queryKey: ["staff-account"],
            url: "staff-account",
            pagination: false,
            enabled: true,
        });
        expect(screen.queryByTestId("mobile-filter-drawer")).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText(ANY)).not.toBeInTheDocument();

        await user.click(filterButton());

        const input = screen.getByPlaceholderText(ANY);
        const table = document.querySelector("[data-table-scroll-container]");
        expect(table).toBeTruthy();
        expect(table).not.toContainElement(input);
        expect(input.compareDocumentPosition(table as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(input.closest("div.w-full")).not.toBeNull();
        expect(screen.queryByPlaceholderText("client.network.placeholder")).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText("client.zone.placeholder")).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText("client.status.placeholder")).not.toBeInTheDocument();

        await user.type(input, "abc");
        await waitFor(() => expect(setFilter).toHaveBeenCalledWith("any=abc"));
        const callsAfterSearch = setFilter.mock.calls.length;

        await user.click(filterButton());

        expect(screen.queryByPlaceholderText(ANY)).not.toBeInTheDocument();
        expect(setFilter.mock.calls.length).toBe(callsAfterSearch);
        expect(setFilter).toHaveBeenLastCalledWith("any=abc");

        await user.click(filterButton());
        expect(screen.getByPlaceholderText(ANY)).toHaveValue("abc");
    });

    it("keeps simple search open and disables the filter toggle when always open", () => {
        accountState.alwaysOpen = true;
        renderTable(true);

        expect(screen.getByPlaceholderText(ANY)).toBeVisible();
        expect(filterButton()).toBeDisabled();
        expect(screen.queryByTestId("mobile-filter-drawer")).not.toBeInTheDocument();

        fireEvent.click(filterButton());

        expect(screen.getByPlaceholderText(ANY)).toBeVisible();
        expect(filterButton()).toBeDisabled();
    });

    it("keeps the bottom drawer for default mode, a failed setting, and simpleSearch off", async () => {
        accountState.mode = "default";
        const { unmount } = renderTable(true);
        expect(drawer()).toHaveAttribute("data-side", "bottom");
        expect(screen.queryByRole("button", { name: "common.filter" })).not.toBeInTheDocument();
        expect(drawer()).toContainElement(screen.getByPlaceholderText(ANY));
        expect(await screen.findByPlaceholderText("client.network.placeholder")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("client.zone.placeholder")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("client.status.placeholder")).toBeInTheDocument();
        unmount();

        accountState.mode = "simple";
        accountState.phase = "loading";
        queryCalls.length = 0;
        const loading = renderTable(true);
        expect(drawer()).toHaveAttribute("data-side", "bottom");
        expect(screen.queryByRole("button", { name: "common.filter" })).not.toBeInTheDocument();
        expect(screen.getAllByPlaceholderText(ANY)).toHaveLength(1);
        expect(drawer()).toContainElement(screen.getByPlaceholderText(ANY));
        loading.unmount();

        accountState.phase = "error";
        const failed = renderTable(true);
        expect(drawer()).toHaveAttribute("data-side", "bottom");
        expect(screen.queryByRole("button", { name: "common.filter" })).not.toBeInTheDocument();
        failed.unmount();

        accountState.phase = "success";
        accountState.useAccount = true;
        accountState.account = { settings: {} };
        const missing = renderTable(true);
        expect(drawer()).toHaveAttribute("data-side", "bottom");
        missing.unmount();

        accountState.useAccount = false;
        queryCalls.length = 0;
        renderTable(false);
        expect(staffAccountQuery()).toMatchObject({ enabled: false });
        expect(drawer()).toHaveAttribute("data-side", "bottom");
        expect(screen.queryByRole("button", { name: "common.filter" })).not.toBeInTheDocument();
    });

    it("leaves the desktop filter unchanged when simple search is enabled", async () => {
        const user = userEvent.setup();
        sidebarState.isMobile = false;
        queryCalls.length = 0;
        renderTable(true);

        expect(staffAccountQuery()).toMatchObject({ enabled: false });
        expect(screen.queryByTestId("mobile-filter-drawer")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "common.filter" })).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText(ANY)).not.toBeInTheDocument();

        const icon = document.querySelector(".lucide-funnel");
        const button = icon?.closest("button");
        expect(button).toBeTruthy();
        await user.click(button as HTMLElement);

        expect(screen.getByPlaceholderText(ANY)).toBeInTheDocument();
        expect(await screen.findByPlaceholderText("client.network.placeholder")).toBeInTheDocument();
        expect(document.querySelector(".lucide-rotate-ccw")).toBeTruthy();
    });
});

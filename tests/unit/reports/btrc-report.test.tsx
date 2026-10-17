import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BtrcReports, { btrcReportSearch } from "@/components/reports/btrc-report";

const toast = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("react-toastify", () => ({
    toast,
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: ({ url }: { url: string }) => {
        if (url === "dropdown-zones") {
            return {
                data: { success: true, data: [{ id: 2, name: "North" }] },
                isLoading: false,
                isError: false,
                error: null,
            };
        }
        return {
            data: { success: true, data: [{ id: 9, name: "Rahim" }] },
            isLoading: false,
            isError: false,
            error: null,
        };
    },
}));

function renderReports() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={client}>
            <BtrcReports />
        </QueryClientProvider>,
    );
}

describe("btrcReportSearch", () => {
    it("omits All so the report is not restricted to one record", () => {
        expect(btrcReportSearch({ zone_id: "all", status: "all" })).toBe("");
        expect(btrcReportSearch({ reseller_id: "all" })).toBe("");
        expect(btrcReportSearch({ scope: "own", zone_id: 2, status: "active" })).toBe("zone_id=2&status=active");
        expect(btrcReportSearch({ reseller_id: 9 })).toBe("reseller_id=9");
    });

    it("sends the reseller-inclusive scope and drops zone", () => {
        expect(btrcReportSearch({ scope: "with_resellers", zone_id: 2, status: "all" })).toBe("scope=with_resellers");
        expect(btrcReportSearch({ scope: "with_resellers", zone_id: 2, status: "inactive" })).toBe(
            "scope=with_resellers&status=inactive",
        );
    });
});

class ResizeObserverStub {
    observe() { }
    unobserve() { }
    disconnect() { }
}

describe("BtrcReports", () => {
    beforeEach(() => {
        toast.success.mockReset();
        toast.error.mockReset();
        URL.createObjectURL = vi.fn(() => "blob:btrc");
        URL.revokeObjectURL = vi.fn();
        vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    });

    it("renders the client and reseller report sections with download buttons", async () => {
        renderReports();

        expect(screen.getByRole("heading", { name: "btrc.title" })).toBeInTheDocument();
        expect(screen.getByText("btrc.client.title")).toBeInTheDocument();
        expect(screen.getByText("btrc.reseller.title")).toBeInTheDocument();
        expect(await screen.findByText("btrc.client.type.with_resellers")).toBeInTheDocument();
        expect(screen.queryByText("btrc.client.zone.label")).not.toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "btrc.download" })).toHaveLength(2);
    });

    it("shows the zone filter for own clients and keeps that download on the existing request", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn(async () => new Response(new Blob(["rows"]), {
            status: 200,
            headers: { "Content-Disposition": 'attachment; filename="BTRC_Clients_List.xls"' },
        }));
        vi.stubGlobal("fetch", fetchMock);
        renderReports();

        const [scopeSelect] = await screen.findAllByRole("combobox", { hidden: true });
        await user.click(scopeSelect);
        await user.click(await screen.findByText("btrc.client.type.own"));

        expect(screen.getByText("btrc.client.zone.label")).toBeInTheDocument();

        const [clientButton] = screen.getAllByRole("button", { name: "btrc.download" });
        await user.click(clientButton);

        expect(fetchMock).toHaveBeenCalledWith("/api/reports/btrc/clients");
    });

    it("downloads both reports and keeps All filters off the request", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            const filename = url.includes("resellers")
                ? "BTRC_Resellers_List.xls"
                : "BTRC_Clients_List.xls";
            return new Response(new Blob(["client_type"]), {
                status: 200,
                headers: { "Content-Disposition": `attachment; filename="${filename}"` },
            });
        });
        vi.stubGlobal("fetch", fetchMock);
        renderReports();

        const [clientButton, resellerButton] = screen.getAllByRole("button", { name: "btrc.download" });
        await user.click(clientButton);
        await user.click(resellerButton);

        expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/reports/btrc/clients?scope=with_resellers");
        expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/reports/btrc/resellers");
        expect(toast.success).toHaveBeenCalledTimes(2);
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("shows an error and does not start a second download while one is in progress", async () => {
        const user = userEvent.setup();
        let release: (() => void) | undefined;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        const fetchMock = vi.fn(async () => {
            await gate;
            return new Response(JSON.stringify({ message: "Could not generate the report" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        });
        vi.stubGlobal("fetch", fetchMock);
        renderReports();

        const [clientButton] = screen.getAllByRole("button", { name: "btrc.download" });
        await user.click(clientButton);
        await user.click(clientButton);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(clientButton).toBeDisabled();

        release?.();
        await vi.waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Could not generate the report");
        });
        expect(clientButton).toBeEnabled();
    });
});

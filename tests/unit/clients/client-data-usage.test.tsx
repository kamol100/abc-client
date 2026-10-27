import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientRouterInfo from "@/components/clients/client-router-info";
import { ClientRow } from "@/components/clients/client-type";

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({
    useFetch,
}));

vi.mock("@/components/clients/client-speed-widget", () => ({
    default: () => <span>speed</span>,
}));

vi.mock("react-toastify", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { date?: string }) => {
            const labels: Record<string, string> = {
                "client.basic_view.up_down": "Up/down",
                "client.basic_view.data_usage": "Data Usage",
                "client.basic_view.usage_today": "Today",
                "client.basic_view.usage_this_month": "This Month",
                "client.basic_view.usage_last_month": "Last Month",
                "client.basic_view.usage_unavailable": "Unavailable",
                "client.basic_view.usage_since": `Recorded since ${options?.date ?? ""}`,
                "client.ip_address.label": "IP",
                "client.basic_view.router_mac": "Router Mac",
                "client.basic_view.uptime": "Uptime",
                "client.basic_view.last_logout": "Last logout",
                "client.basic_view.is_online": "Is Online",
                "client.basic_view.online": "Online",
                "client.basic_view.offline": "Offline",
                "client.network.label": "Network",
            };

            return labels[key] ?? key;
        },
    }),
}));

const client = {
    id: "client-1",
    network: { id: 1, name: "Core" },
} as ClientRow;

const gigabyte = 1024 ** 3;

function usagePayload(overrides?: { collected?: boolean }) {
    return {
        success: true,
        data: {
            timezone: "Asia/Dhaka",
            collected: overrides?.collected ?? true,
            collected_from: "2026-03-02",
            today: {
                upload_bytes: 2 * gigabyte,
                download_bytes: 8 * gigabyte,
                total_bytes: 10 * gigabyte,
                from: "2026-03-15",
                to: "2026-03-15",
                available: true,
                complete: false,
            },
            this_month: {
                upload_bytes: 50 * gigabyte,
                download_bytes: 250 * gigabyte,
                total_bytes: 300 * gigabyte,
                from: "2026-03-01",
                to: "2026-03-15",
                available: true,
                complete: false,
            },
            last_month: {
                upload_bytes: 0,
                download_bytes: 0,
                total_bytes: 0,
                from: "2026-02-01",
                to: "2026-02-28",
                available: false,
                complete: false,
            },
        },
    };
}

function renderInfo() {
    return render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <ClientRouterInfo client={client} />
        </QueryClientProvider>
    );
}

describe("Client data usage", () => {
    beforeEach(() => {
        useFetch.mockReset();
    });

    it("shows formatted period totals after the speed row", async () => {
        useFetch.mockImplementation(async ({ url }: { url: string }) => {
            if (String(url).includes("client-usage")) {
                return usagePayload();
            }

            return { success: true, data: { ip_address: "10.0.0.8", is_online: true } };
        });

        renderInfo();

        expect(await screen.findByText("10 GB")).toBeInTheDocument();
        expect(screen.getByText("300 GB")).toBeInTheDocument();
        expect(screen.getByText("Today")).toBeInTheDocument();
        expect(screen.getByText("This Month")).toBeInTheDocument();
        expect(screen.getByText("Last Month")).toBeInTheDocument();
        expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);

        const speed = screen.getByText("Up/down");
        const usage = screen.getByText("Data Usage");
        expect(speed.compareDocumentPosition(usage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(screen.getByText("10.0.0.8")).toBeInTheDocument();
        expect(screen.getByText("speed")).toBeInTheDocument();
        expect(screen.getAllByTitle("Recorded since 2026-03-02")).toHaveLength(2);
    });

    it("shows a loading state without blocking router information", async () => {
        let resolveUsage: (value: unknown) => void = () => undefined;
        useFetch.mockImplementation(({ url }: { url: string }) => {
            if (String(url).includes("client-usage")) {
                return new Promise((resolve) => {
                    resolveUsage = resolve;
                });
            }

            return Promise.resolve({ success: true, data: { ip_address: "10.0.0.8", is_online: false } });
        });

        renderInfo();

        expect(await screen.findByText("10.0.0.8")).toBeInTheDocument();
        expect(screen.getByText("speed")).toBeInTheDocument();
        expect(screen.getByText("Data Usage").parentElement?.querySelector("[aria-busy='true']")).not.toBeNull();
        expect(screen.queryByText("10 GB")).not.toBeInTheDocument();

        resolveUsage(usagePayload());

        expect(await screen.findByText("10 GB")).toBeInTheDocument();
    });

    it("keeps router information when usage is missing or the request fails", async () => {
        useFetch.mockImplementation(async ({ url }: { url: string }) => {
            if (String(url).includes("client-usage")) {
                return usagePayload({ collected: false });
            }

            return { success: true, data: { ip_address: "10.0.0.8", is_online: true } };
        });

        const view = renderInfo();
        expect(await screen.findByText("Unavailable")).toBeInTheDocument();
        expect(screen.queryByText("10 GB")).not.toBeInTheDocument();
        expect(screen.getByText("10.0.0.8")).toBeInTheDocument();

        useFetch.mockImplementation(async ({ url }: { url: string }) => {
            if (String(url).includes("client-usage")) {
                return { success: false, message: "failed" };
            }

            return { success: true, data: { ip_address: "10.0.0.8", is_online: true } };
        });

        view.rerender(
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <ClientRouterInfo client={client} />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Unavailable")).toBeInTheDocument();
        });
        expect(screen.getByText("speed")).toBeInTheDocument();
        expect(screen.getByText("10.0.0.8")).toBeInTheDocument();
    });

    it("fetches usage once for the same client", async () => {
        useFetch.mockImplementation(async ({ url }: { url: string }) => {
            if (String(url).includes("client-usage")) {
                return usagePayload();
            }

            return { success: true, data: { ip_address: "10.0.0.8", is_online: true } };
        });

        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const view = render(
            <QueryClientProvider client={queryClient}>
                <ClientRouterInfo client={client} />
            </QueryClientProvider>
        );

        expect(await screen.findByText("10 GB")).toBeInTheDocument();

        view.rerender(
            <QueryClientProvider client={queryClient}>
                <ClientRouterInfo client={client} />
            </QueryClientProvider>
        );

        await waitFor(() => {
            const usageCalls = useFetch.mock.calls.filter((call) => String(call[0]?.url).includes("client-usage"));
            expect(usageCalls).toHaveLength(1);
        });
    });
});

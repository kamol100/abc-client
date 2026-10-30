import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientOnlineStatusCell, { ClientOnlineStatusProvider } from "@/components/clients/client-online-status-cell";

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({
    useFetch,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const labels: Record<string, string> = {
                "client.online.ip": "IP",
                "client.online.mac": "MAC",
                "client.online.uptime": "UT",
                "client.basic_view.online": "Online",
                "client.basic_view.offline": "Offline",
                "client.basic_view.ping": "Ping on this ip",
                "client.basic_view.open_ip": "Open",
            };
            return labels[key] ?? key;
        },
    }),
}));

const clientId = "client-1";

function renderCell() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <ClientOnlineStatusProvider clientIds={[clientId]}>
                <ClientOnlineStatusCell clientId={clientId} />
            </ClientOnlineStatusProvider>
        </QueryClientProvider>
    );
}

function rowClasses(root: HTMLElement) {
    return [...root.children].map((row) => row.className);
}

describe("ClientOnlineStatusCell", () => {
    beforeEach(() => {
        useFetch.mockReset();
    });

    it("keeps the same cell box while online status loads", async () => {
        let resolveStatus: (value: unknown) => void = () => undefined;
        useFetch.mockImplementation(
            () => new Promise((resolve) => {
                resolveStatus = resolve;
            })
        );

        renderCell();

        const skeleton = screen.getByRole("generic", { busy: true });
        const skeletonRows = rowClasses(skeleton);
        expect(skeleton.className).toContain("w-60");
        expect(skeleton.className).toContain("min-w-60");
        expect(skeletonRows).toEqual([
            "flex h-9 items-center",
            "flex h-5 items-center",
            "flex h-4 items-center",
        ]);

        resolveStatus({
            success: true,
            data: {
                [clientId]: {
                    ip_address: "192.168.100.254",
                    router_mac_address: "AA:BB:CC:DD:EE:FF",
                    uptime: "1w2d3h",
                    is_online: true,
                },
            },
        });

        const loaded = await screen.findByText("MAC: AA:BB:CC:DD:EE:FF");
        const cell = loaded.parentElement?.parentElement;
        expect(cell).toBeTruthy();
        expect(cell?.className).toBe(skeleton.className);
        expect(rowClasses(cell as HTMLElement).map((className) => className.split(" ").slice(0, 3).join(" "))).toEqual([
            "flex h-9 items-center",
            "flex h-5 items-center",
            "flex h-4 items-center",
        ]);
        expect(screen.getByText("192.168.100.254")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByRole("generic", { busy: true })).not.toBeInTheDocument();
        });
    });
});

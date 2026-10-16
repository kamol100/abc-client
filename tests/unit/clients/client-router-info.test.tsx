import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientRouterInfo, { ClientIpPingButton } from "@/components/clients/client-router-info";
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
        t: (key: string, options?: { url?: string }) => {
            if (key === "client.basic_view.ping") return "Ping on this ip";
            if (key === "client.basic_view.ping_unavailable") return "ip not found";
            if (key === "client.basic_view.open_ip") return `Open ${options?.url}`;
            return key;
        },
    }),
}));

const client = {
    id: "client-1",
    network: { id: 1, name: "Core" },
} as ClientRow;

function routerCalls() {
    return useFetch.mock.calls.filter((call) => String(call[0]?.url).includes("client-router-info"));
}

function pingCalls() {
    return useFetch.mock.calls.filter((call) => String(call[0]?.url).includes("client-ping"));
}

function renderPing(queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
})) {
    return render(
        <QueryClientProvider client={queryClient}>
            <ClientIpPingButton clientId="client-1" />
        </QueryClientProvider>
    );
}

describe("ClientRouterInfo ping button", () => {
    beforeEach(() => {
        useFetch.mockReset();
    });

    it("shows a loading button until router information arrives", async () => {
        let resolveRouter: (value: unknown) => void = () => undefined;
        useFetch.mockImplementation(
            () => new Promise((resolve) => {
                resolveRouter = resolve;
            })
        );

        renderPing();

        const loadingButton = screen.getByRole("button", { name: "Ping on this ip" });
        expect(loadingButton).toBeDisabled();
        expect(loadingButton).toHaveAttribute("aria-busy", "true");
        expect(screen.queryByText("10.0.0.8")).not.toBeInTheDocument();

        resolveRouter({
            success: true,
            data: { ip_address: "10.0.0.8", is_online: true },
        });

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Ping on this ip" })).toBeEnabled();
        });
        const pingButton = screen.getByRole("button", { name: "Ping on this ip" });
        expect(pingButton).not.toHaveAttribute("aria-busy");
        expect(routerCalls()).toHaveLength(1);
    });

    it("applies the button variant, defaulting to outline", async () => {
        useFetch.mockResolvedValue({
            success: true,
            data: { ip_address: "10.0.0.8", is_online: true },
        });

        const { rerender } = renderPing();

        const outlined = await screen.findByRole("button", { name: "Ping on this ip" });
        expect(outlined.className).toContain("border-input");

        rerender(
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <ClientIpPingButton clientId="client-1" buttonVariant="ghost" />
            </QueryClientProvider>
        );

        const ghost = await screen.findByRole("button", { name: "Ping on this ip" });
        expect(ghost.className).not.toContain("border-input");
    });

    it("replaces the loading button when router information fails", async () => {
        useFetch.mockResolvedValue({ success: false, message: "Client is offline" });

        renderPing();

        const unavailableButtons = await screen.findAllByRole("button", { name: "ip not found" });
        expect(unavailableButtons).toHaveLength(2);
        expect(unavailableButtons[0]).toBeDisabled();
        expect(unavailableButtons[1]).toBeDisabled();
        expect(unavailableButtons[0]).not.toHaveAttribute("aria-busy");
        expect(routerCalls()).toHaveLength(1);
    });

    it("keeps ping disabled and does not call the ping API without a valid IP", async () => {
        useFetch.mockResolvedValue({
            success: true,
            data: { ip_address: "not-an-ip", is_online: false },
        });
        const user = userEvent.setup();

        renderPing();

        const open = vi.spyOn(window, "open").mockImplementation(() => null);
        const unavailableButtons = await screen.findAllByRole("button", { name: "ip not found" });
        expect(unavailableButtons).toHaveLength(2);
        expect(unavailableButtons[0]).toBeDisabled();
        expect(unavailableButtons[1]).toBeDisabled();
        await user.click(unavailableButtons[0]);
        await user.click(unavailableButtons[1]);
        expect(pingCalls()).toHaveLength(0);
        expect(open).not.toHaveBeenCalled();

        await user.hover(unavailableButtons[0]);
        expect(await screen.findByRole("tooltip")).toHaveTextContent("ip not found");
        open.mockRestore();
    });

    it("pings a valid IP and reuses the cached router response", async () => {
        useFetch.mockImplementation(async ({ url }: { url: string }) => {
            if (url.includes("client-ping")) {
                return { success: true, data: { reachable: true } };
            }

            return {
                success: true,
                data: { ip_address: "10.0.0.8", is_online: true },
            };
        });
        const user = userEvent.setup();
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });

        const view = render(
            <QueryClientProvider client={queryClient}>
                <ClientIpPingButton clientId="client-1" />
                <ClientRouterInfo client={client} />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Ping on this ip" })).toBeEnabled();
        });
        expect(screen.getAllByRole("button", { name: "Ping on this ip" })).toHaveLength(1);
        expect(screen.getByText("10.0.0.8").closest("span")?.querySelector("button")).toBeNull();
        expect(routerCalls()).toHaveLength(1);

        const pingButton = screen.getByRole("button", { name: "Ping on this ip" });
        await user.hover(pingButton);
        expect(await screen.findByRole("tooltip")).toHaveTextContent("Ping on this ip");

        await user.click(pingButton);
        await waitFor(() => expect(pingCalls()).toHaveLength(1));
        expect(pingCalls()[0][0].url).toBe("/client-ping/client-1?ip=10.0.0.8");
        expect(routerCalls()).toHaveLength(1);

        view.rerender(
            <QueryClientProvider client={queryClient}>
                <ClientIpPingButton clientId="client-1" />
                <ClientRouterInfo client={client} />
            </QueryClientProvider>
        );

        expect(await screen.findByRole("button", { name: "Ping on this ip" })).toBeEnabled();
        expect(routerCalls()).toHaveLength(1);
    });

    it("uses a provided IP without fetching router information", async () => {
        useFetch.mockImplementation(async ({ url }: { url: string }) => {
            if (url.includes("client-ping")) {
                return { success: true, data: { reachable: true } };
            }

            return { success: true, data: { ip_address: "10.9.9.9" } };
        });
        const open = vi.spyOn(window, "open").mockImplementation(() => null);
        const user = userEvent.setup();

        render(
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <ClientIpPingButton clientId="client-1" ipAddress="10.0.0.8" buttonVariant="ghost" />
            </QueryClientProvider>
        );

        const pingButton = screen.getByRole("button", { name: "Ping on this ip" });
        const openButton = screen.getByRole("button", { name: "Open http://10.0.0.8:80" });
        expect(pingButton).toBeEnabled();
        expect(pingButton.className).not.toContain("border-input");
        expect(routerCalls()).toHaveLength(0);

        await user.click(pingButton);
        await waitFor(() => expect(pingCalls()).toHaveLength(1));
        expect(pingCalls()[0][0].url).toBe("/client-ping/client-1?ip=10.0.0.8");
        expect(routerCalls()).toHaveLength(0);

        await user.click(openButton);
        expect(open).toHaveBeenCalledWith("http://10.0.0.8:80", "_blank", "noopener,noreferrer");
        open.mockRestore();
    });

    it("opens the device address on port 80", async () => {
        useFetch.mockResolvedValue({
            success: true,
            data: { ip_address: "10.10.10.102", is_online: true },
        });
        const open = vi.spyOn(window, "open").mockImplementation(() => null);
        const user = userEvent.setup();

        renderPing();

        const openButton = await screen.findByRole("button", { name: "Open http://10.10.10.102:80" });
        await user.click(openButton);

        expect(open).toHaveBeenCalledWith("http://10.10.10.102:80", "_blank", "noopener,noreferrer");
        expect(pingCalls()).toHaveLength(0);
        open.mockRestore();
    });
});

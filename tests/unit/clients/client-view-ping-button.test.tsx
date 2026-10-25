import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientView from "@/components/clients/client-view";

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({
    useFetch,
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: () => true,
    }),
    useSettings: () => ({
        settings: { roles: ["Admin"] },
    }),
}));

vi.mock("@/components/clients/client-speed-widget", () => ({
    default: () => null,
}));

vi.mock("@/components/clients/client-history", () => ({
    default: () => null,
}));

vi.mock("@/components/clients/client-onu-section", () => ({
    default: () => null,
}));

vi.mock("@/components/clients/client-session-reset-dialog", () => ({
    default: () => null,
}));

vi.mock("@/components/clients/client-change-package-dialog", () => ({
    default: () => null,
}));

vi.mock("@/components/clients/client-sms", () => ({
    default: () => null,
}));

vi.mock("@/components/clients/client-ticket", () => ({
    default: () => null,
}));

vi.mock("@/components/invoices/invoice-table", () => ({
    default: () => null,
}));

vi.mock("@/components/invoices/bulk-invoice-pay-dialog", () => ({
    default: () => null,
}));

vi.mock("@/components/payments/payment-table", () => ({
    default: () => null,
}));

vi.mock("@/components/tickets/ticket-table", () => ({
    default: () => null,
}));

vi.mock("react-toastify", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === "client.basic_view.ping") return "Ping on this ip";
            if (key === "client.basic_view.ping_unavailable") return "ip not found";
            return key;
        },
    }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("ClientView ping button placement", () => {
    beforeEach(() => {
        useFetch.mockReset();
        useFetch.mockImplementation(async ({ url }: { url: string }) => {
            if (url.includes("client-router-info")) {
                return { success: true, data: { ip_address: "10.0.0.8", is_online: true } };
            }

            if (url.includes("clients/")) {
                return {
                    success: true,
                    data: { id: "client-1", name: "Kamal", phone: "01700000000", status: 1 },
                };
            }

            return { success: true, data: {} };
        });
    });

    it("places the ping button after the SMS button", async () => {
        render(
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <ClientView clientId="client-1" />
            </QueryClientProvider>
        );

        const smsButton = await screen.findByRole("button", { name: "client.actions.sms" });
        const lockButton = screen.getByRole("button", { name: "client.actions.lock" });
        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Ping on this ip" })).toBeEnabled();
        });
        const pingButton = screen.getByRole("button", { name: "Ping on this ip" });
        expect(smsButton.compareDocumentPosition(lockButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(lockButton.compareDocumentPosition(pingButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(screen.getAllByRole("button", { name: "Ping on this ip" })).toHaveLength(1);

        await waitFor(() => {
            const routerCalls = useFetch.mock.calls.filter((call) => String(call[0]?.url).includes("client-router-info"));
            expect(routerCalls).toHaveLength(1);
        });
    });

    it("opens the lock confirmation from the lock button", async () => {
        const user = userEvent.setup();
        render(
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <ClientView clientId="client-1" />
            </QueryClientProvider>
        );

        await user.click(await screen.findByRole("button", { name: "client.actions.lock" }));
        expect(await screen.findByText("client.lock.confirm_lock")).toBeInTheDocument();
    });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";

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
    useProfile: () => ({
        profile: {},
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

vi.mock("@/components/products/client-product-table", () => ({
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

vi.mock("@/components/clients/client-switch-dialog", () => ({
    default: ({ open }: { open: boolean }) => (open ? <div>client.switch_reseller.title</div> : null),
}));

vi.mock("@/components/clients/client-add-map-dialog", () => ({
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

const listRow = {
    id: "client-1",
    name: "Kamal Hossain",
    phone: "01700000000",
    pppoe_username: "kamal-ppp",
    status: 1,
};

const detail = {
    ...listRow,
    pppoe_password: "secret-pw",
    wallet: { balance: 250 },
};

function seededQueryClient() {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["clients", { page: 1 }], {
        success: true,
        data: { data: [{ ...listRow, id: "other", name: "Other client" }, listRow], pagination: {} },
    });
    return queryClient;
}

function renderView(queryClient: QueryClient) {
    return render(
        <QueryClientProvider client={queryClient}>
            <ClientView clientId="client-1" />
        </QueryClientProvider>
    );
}

describe("ClientView opened from the client list", () => {
    let resolveDetail: (value: unknown) => void = () => undefined;

    beforeEach(() => {
        useFetch.mockReset();
        useFetch.mockImplementation(({ url }: { url: string }) => {
            if (url.startsWith("/clients/client-1")) {
                return new Promise((resolve) => {
                    resolveDetail = resolve;
                });
            }
            return Promise.resolve({ success: true, data: {} });
        });
    });

    // তালিকায় আগে লোড হওয়া ক্লায়েন্টের সারি দিয়ে পূর্ণ তথ্য আসার আগেই নাম দেখা যায়, আর শুধু-বিস্তারিত ঘর ও অ্যাকশন বোতাম অপেক্ষায় থাকে কি না যাচাই করি।
    it("Client view from list: shows the list row at once and holds actions and detail-only fields until the full record arrives", async () => {
        renderView(seededQueryClient());

        const basicCard = screen.getByText("client.basic_view.basic_information").closest("div.overflow-hidden") as HTMLElement;
        expect(within(basicCard).getByText("Kamal Hossain")).toBeInTheDocument();
        expect(within(basicCard).getByText("kamal-ppp")).toBeInTheDocument();
        expect(screen.queryByText("secret-pw")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "client.actions.change_package" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "client.basic_view.copy" })).toBeDisabled();

        resolveDetail({ success: true, data: detail });

        expect(await screen.findByText("secret-pw")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "client.actions.change_package" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "client.basic_view.copy" })).toBeEnabled();
    });

    // তালিকার সারি দেখানোর সময়ই রাউটারের তথ্যের অনুরোধ শুরু হয়, পূর্ণ তথ্যের জন্য অপেক্ষা করে না কি না যাচাই করি।
    it("Client view from list: starts the router information request before the full record arrives", async () => {
        renderView(seededQueryClient());

        await waitFor(() => {
            const routerCalls = useFetch.mock.calls.filter((call) => String(call[0]?.url).includes("client-router-info"));
            expect(routerCalls).toHaveLength(1);
        });
        expect(screen.queryByText("secret-pw")).not.toBeInTheDocument();
    });

    // তালিকায় ক্লায়েন্ট না থাকলে (যেমন নতুন ট্যাবে) আগের মতো স্কেলেটন দেখায় এবং পূর্ণ তথ্য এলে নাম দেখা যায় কি না যাচাই করি।
    it("Client view without the list loaded: shows the skeleton until the full record arrives", async () => {
        renderView(new QueryClient({ defaultOptions: { queries: { retry: false } } }));

        expect(screen.queryByText("Kamal Hossain")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "client.actions.change_package" })).not.toBeInTheDocument();

        resolveDetail({ success: true, data: detail });

        expect(await screen.findByText("secret-pw")).toBeInTheDocument();
        expect(screen.getAllByText("Kamal Hossain").length).toBeGreaterThan(0);
    });
});

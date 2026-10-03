import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "@/app/actions";
import { ClientRow } from "@/components/clients/client-type";
import { ResellerRechargeDialog } from "@/components/wallets/reseller-recharge";

const state = vi.hoisted(() => ({
    details: undefined as ClientRow | undefined,
    wallet: {
        balance: 100,
        isSuccess: true,
        isLoading: false,
        isError: false,
    },
    clientLoading: false,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (value: string) => value,
        i18n: { language: "en" },
    }),
}));

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(async () => ({ success: true, data: {} })),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => ({
        data: state.details ? { success: true, data: state.details } : undefined,
        isLoading: state.clientLoading,
        isError: false,
    }),
}));

vi.mock("@/hooks/use-my-wallet", () => ({
    useMyWallet: () => state.wallet,
}));

const client = {
    id: "client-1",
    name: "Rahim",
    phone: "01700000000",
    pppoe_username: "rahim01",
    current_address: "Dhaka",
    termination_date: "01-Dec-26",
    package: {
        id: 1,
        name: "Home 10",
        bandwidth: "10Mbps",
        price: 100,
        buying_price: 60,
    },
} as ClientRow;

const renderDialog = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <ResellerRechargeDialog client={client} open onOpenChange={vi.fn()} />
        </QueryClientProvider>,
    );
};

describe("ResellerRechargeDialog", () => {
    beforeEach(() => {
        state.details = client;
        state.clientLoading = false;
        state.wallet = {
            balance: 100,
            isSuccess: true,
            isLoading: false,
            isError: false,
        };
    });

    it("shows the client package summary and a one-day buying cost", () => {
        renderDialog();

        expect(screen.getByText("Rahim")).toBeInTheDocument();
        expect(screen.getByText("rahim01")).toBeInTheDocument();
        expect(screen.getByText("01700000000")).toBeInTheDocument();
        expect(screen.getByText("Dhaka")).toBeInTheDocument();
        expect(screen.getByText("Home 10")).toBeInTheDocument();
        expect(screen.getByText("10Mbps")).toBeInTheDocument();
        expect(screen.getByText("01 Dec 2026")).toBeInTheDocument();
        expect(screen.getAllByText(/BDT\s*2\.00/).length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: "common.save" })).toBeEnabled();
    });

    it("posts clientUuid, cost, days, and note", async () => {
        const user = userEvent.setup();
        renderDialog();

        await user.click(screen.getByRole("button", { name: "common.save" }));

        expect(useFetch).toHaveBeenCalledWith({
            url: "/client-wallet-recharge",
            method: "POST",
            data: {
                clientUuid: "client-1",
                cost: 2,
                days: 1,
                note: "",
            },
        });
    });

    it("updates the recharge cost when the day count changes", async () => {
        const user = userEvent.setup();
        renderDialog();

        const days = screen.getByRole("spinbutton");
        await user.clear(days);
        await user.type(days, "5");

        expect(screen.getAllByText(/BDT\s*10\.00/).length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "common.save" }));

        expect(useFetch).toHaveBeenCalledWith({
            url: "/client-wallet-recharge",
            method: "POST",
            data: {
                clientUuid: "client-1",
                cost: 10,
                days: 5,
                note: "",
            },
        });
    });

    it("blocks submit when the wallet cannot cover the cost", () => {
        state.wallet.balance = 1;
        renderDialog();

        expect(screen.getByRole("alert")).toHaveTextContent(
            "wallet.messages.insufficient_balance",
        );
        expect(screen.getByRole("button", { name: "common.save" })).toBeDisabled();
        expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    });

    it("shows a placeholder and blocks submit when buying price is missing", () => {
        state.details = {
            ...client,
            phone: null,
            current_address: null,
            termination_date: null,
            package: {
                id: 1,
                name: "Home 10",
                bandwidth: null,
                price: null,
                buying_price: null,
            },
        };
        renderDialog();

        expect(screen.getByRole("alert")).toHaveTextContent(
            "wallet.recharge_cost.errors.invalid_package",
        );
        expect(screen.getByRole("button", { name: "common.save" })).toBeDisabled();
        expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    });
});

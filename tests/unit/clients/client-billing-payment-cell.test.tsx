import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientBillingPaymentCell from "@/components/clients/client-billing-payment-cell";
import { ClientRow, InvoiceDueItem } from "@/components/clients/client-type";

const dialogModule = vi.hoisted(() => ({
    imports: 0,
}));

const permissions = vi.hoisted(() => ({
    canPay: true,
}));

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/app/actions", () => ({
    useFetch,
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => permissions.canPay && name === "invoices.pay",
    }),
}));

vi.mock("@/components/display-count", () => ({
    default: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

vi.mock("@/components/invoices/bulk-invoice-pay-dialog", () => {
    dialogModule.imports += 1;
    return {
        default: ({
            open,
            onOpenChange,
            invoiceDue,
        }: {
            open: boolean;
            onOpenChange: (open: boolean) => void;
            invoiceDue: InvoiceDueItem[];
        }) => (
            <div data-testid="pay-dialog" data-open={String(open)}>
                <button type="button" onClick={() => onOpenChange(false)}>
                    close-pay
                </button>
                {invoiceDue.map((item) => item.uuid).join(",")}
            </div>
        ),
    };
});

const client = {
    status: 1,
    name: "Kamal",
    billing_term: "prepaid",
    payment_deadline: "20",
    invoiceDue: [{ uuid: "inv-1", total_amount: 150 } as InvoiceDueItem],
} as ClientRow;

describe("ClientBillingPaymentCell payment action", () => {
    beforeEach(() => {
        dialogModule.imports = 0;
        permissions.canPay = true;
        useFetch.mockReset();
    });

    it("shows the due amount and loads payment only after the icon is clicked", async () => {
        render(<ClientBillingPaymentCell client={client} />);

        expect(screen.getByText("150")).toBeInTheDocument();
        expect(screen.getByText("prepaid")).toBeInTheDocument();
        expect(screen.getByText("client.table.deadline: 20")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "client.actions.pay" })).toBeInTheDocument();
        expect(screen.queryByTestId("pay-dialog")).not.toBeInTheDocument();
        expect(dialogModule.imports).toBe(0);
        expect(useFetch).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "client.actions.pay" }));

        await waitFor(() => {
            expect(screen.getByTestId("pay-dialog")).toBeInTheDocument();
        });

        expect(screen.getByTestId("pay-dialog")).toHaveAttribute("data-open", "true");
        expect(screen.getByTestId("pay-dialog")).toHaveTextContent("inv-1");
        expect(dialogModule.imports).toBe(1);
        expect(useFetch).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole("button", { name: "close-pay" }));

        expect(screen.getByTestId("pay-dialog")).toHaveAttribute("data-open", "false");
    });

    it("hides the payment icon without invoices.pay", () => {
        permissions.canPay = false;

        render(<ClientBillingPaymentCell client={{ ...client, status: 0 }} />);

        expect(screen.queryByRole("button", { name: "client.actions.pay" })).not.toBeInTheDocument();
        expect(screen.getByText("150").parentElement).toHaveClass("text-destructive");
        expect(dialogModule.imports).toBe(0);
        expect(useFetch).not.toHaveBeenCalled();
    });

    it("shows a zero due amount when the client has no invoices", () => {
        render(<ClientBillingPaymentCell client={{ ...client, invoiceDue: [] }} />);

        expect(screen.getByText("0")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "client.actions.pay" })).toBeInTheDocument();
        expect(dialogModule.imports).toBe(0);
    });
});

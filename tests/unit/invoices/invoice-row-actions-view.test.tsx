import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import InvoiceRowActions from "@/components/invoices/invoice-row-actions";
import type { InvoiceRow } from "@/components/invoices/invoice-type";

const useFetch = vi.fn();

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) =>
            ["invoices.show", "invoices.pay", "invoices.edit", "invoices.delete"].includes(name),
    }),
}));

vi.mock("@/app/actions", () => ({
    useFetch: (...args: unknown[]) => useFetch(...args),
}));

vi.mock("@/components/invoices/invoice-print-dialog", () => ({
    default: () => null,
}));

vi.mock("@/components/invoices/invoice-view-dialog", () => ({
    default: ({ open }: { open: boolean }) => (open ? <div>invoice-view-open</div> : null),
}));

vi.mock("@/components/delete-modal", () => ({
    DeleteModal: () => null,
}));

const dueInvoice = {
    id: 12,
    uuid: "invoice-uuid",
    status: "due",
    trackID: "16398",
} as InvoiceRow;

describe("InvoiceRowActions view", () => {
    it("opens the invoice view without starting a payment", async () => {
        const user = userEvent.setup();
        useFetch.mockReset();

        render(<InvoiceRowActions invoice={dueInvoice} />);

        await user.click(screen.getByRole("button", { name: "invoice.actions.view" }));

        expect(screen.getByText("invoice-view-open")).toBeInTheDocument();
        expect(useFetch).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "invoice.actions.pay" })).toBeInTheDocument();
    });

    it("keeps view available after the invoice is paid", () => {
        render(<InvoiceRowActions invoice={{ ...dueInvoice, status: "paid" }} />);

        expect(screen.getByRole("button", { name: "invoice.actions.view" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "invoice.actions.print" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "invoice.actions.pay" })).not.toBeInTheDocument();
    });
});

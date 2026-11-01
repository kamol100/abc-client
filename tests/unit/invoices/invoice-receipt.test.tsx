import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InvoiceReceipt from "@/components/invoices/invoice-receipt";
import type { InvoiceDetail } from "@/components/invoices/invoice-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    useSettings: () => ({
        settings: {
            company: "VP Net",
            company_address: "Dhaka",
            company_phone: "22222222222",
        },
    }),
}));

const invoice = {
    id: 12,
    trackID: "INV-12",
    total_amount: 800,
    discount: 0,
    line_total_discount: 50,
    total_discount: 50,
    after_discount_amount: 750,
    amount_paid: 500,
    amount_due: 250,
    client: { id: 1, sid: 99, name: "Kamal", phone: "01700000000", pppoe_username: "kamal01" },
    lines: [
        {
            description: "Monthly package",
            amount: 800,
            quantity: 1,
            total_amount: 800,
            discount: 0,
        },
    ],
} as InvoiceDetail;

describe("InvoiceReceipt thermal layout", () => {
    it("renders a 384-dot black receipt for a 58mm thermal head", () => {
        const { container } = render(<InvoiceReceipt invoices={[invoice]} />);
        const root = container.querySelector("[data-receipt-root]");

        expect(root).not.toBeNull();
        expect(root?.className).toContain("w-[384px]");
        expect(root?.className).toContain("bg-white");
        expect(root?.className).toContain("text-black");
        expect(container.innerHTML).not.toContain("grid-cols-12");
        expect(container.innerHTML).not.toContain("text-muted-foreground");
        expect(container.innerHTML).not.toContain("text-[11px]");
        expect(screen.getByText("invoice.receipt.pppoe_id:")).toBeInTheDocument();
        expect(screen.getByText("kamal01")).toBeInTheDocument();
        expect(screen.getByText("VP Net")).toBeInTheDocument();
        expect(screen.getByText("INV-12: Monthly package 1x800")).toBeInTheDocument();
        expect(screen.queryByText("invoice.receipt.invoice_id:")).not.toBeInTheDocument();
        expect(screen.getByText("invoice.receipt.due:")).toBeInTheDocument();
        expect(screen.getByText("invoice.receipt.for_support: 22222222222")).toBeInTheDocument();
    });
});

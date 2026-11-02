import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InvoiceReceipt from "@/components/invoices/invoice-receipt";
import {
    DEFAULT_INVOICE_PRINT_SETTINGS,
    receiptContentPaddingX,
    type InvoicePrintSettings,
} from "@/components/invoices/invoice-print-config";
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
            support_phone: "09666777888",
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
        expect(screen.getByText("invoice.receipt.for_support: 09666777888")).toBeInTheDocument();
        expect(screen.queryByText("invoice.receipt.for_support: 22222222222")).not.toBeInTheDocument();
        expect(screen.queryByText(/Seven Hundred Fifty/)).not.toBeInTheDocument();
    });

    it("hides a disabled field and applies typography only when print settings are passed", () => {
        const printSettings: InvoicePrintSettings = {
            ...DEFAULT_INVOICE_PRINT_SETTINGS,
            show_company_name: false,
            show_thank_you: false,
            show_client_phone: false,
            font_size: 32,
            font_weight: 500,
        };
        const { container } = render(<InvoiceReceipt invoices={[invoice]} printSettings={printSettings} />);
        const root = container.querySelector("[data-receipt-variant='custom']");

        expect(root).toHaveStyle({ fontSize: "32px", fontWeight: "500" });
        expect(screen.queryByText("VP Net")).not.toBeInTheDocument();
        expect(screen.queryByText("invoice.receipt.thank_you")).not.toBeInTheDocument();
        expect(screen.queryByText("01700000000")).not.toBeInTheDocument();
        expect(screen.getByText(/Seven Hundred Fifty/)).toBeInTheDocument();
        expect(screen.getByText("invoice.receipt.for_support: 09666777888")).toBeInTheDocument();
        expect(container.innerHTML).not.toContain("text-[36px]");
    });

    it("prints the amount in words immediately before the thank-you message", () => {
        render(<InvoiceReceipt invoices={[invoice]} printSettings={DEFAULT_INVOICE_PRINT_SETTINGS} />);

        const paid = screen.getByText("invoice.receipt.paid:");
        const words = screen.getByText(/Seven Hundred Fifty invoice\.receipt\.only/);
        const thanks = screen.getByText("invoice.receipt.thank_you");

        expect(screen.queryByText("invoice.receipt.in_words:")).not.toBeInTheDocument();
        expect(paid.compareDocumentPosition(words) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(words.compareDocumentPosition(thanks) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(words.nextElementSibling).toBe(thanks);
    });

    it("keeps the original 16px inset and applies content spacing only on the left and right", () => {
        expect(receiptContentPaddingX("comfortable")).toBe(24);
        expect(receiptContentPaddingX("standard")).toBe(16);
        expect(receiptContentPaddingX("compact")).toBe(8);
        expect(receiptContentPaddingX("narrow")).toBe(4);
        expect(receiptContentPaddingX("full")).toBe(0);

        const { container, rerender } = render(<InvoiceReceipt invoices={[invoice]} />);
        const root = () => container.querySelector<HTMLElement>("[data-receipt-root]");

        expect(root()?.className).toContain("px-[16px]");
        expect(root()?.className).toContain("pt-[16px]");
        expect(root()?.className).toContain("pb-[24px]");
        expect(root()).not.toHaveAttribute("data-receipt-padding-x");

        rerender(<InvoiceReceipt invoices={[invoice]} printSettings={DEFAULT_INVOICE_PRINT_SETTINGS} />);
        expect(root()).toHaveStyle({ paddingLeft: "16px", paddingRight: "16px" });
        expect(root()?.className).not.toContain("px-[16px]");
        expect(root()?.className).toContain("pt-[16px]");
        expect(root()?.className).toContain("pb-[24px]");
        expect(root()?.querySelector("[data-receipt-item-row] span")?.className).toContain("truncate");

        rerender(
            <InvoiceReceipt
                invoices={[invoice]}
                printSettings={{ ...DEFAULT_INVOICE_PRINT_SETTINGS, content_spacing: "full" }}
            />,
        );
        expect(root()).toHaveStyle({ paddingLeft: "0px", paddingRight: "0px" });
        expect(root()).toHaveAttribute("data-receipt-padding-x", "0");
        expect(root()?.className).toContain("[overflow-wrap:anywhere]");
        expect(root()?.querySelector("[data-receipt-item-row] span")?.className).toContain("break-words");
        expect(root()?.querySelector("[data-receipt-item-row] span")?.className).not.toContain("truncate");
    });
});

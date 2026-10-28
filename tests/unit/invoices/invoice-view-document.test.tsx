import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvoiceViewDocument } from "@/components/invoices/invoice-view-document";
import { buildInvoiceViewModel, formatInvoiceAmount } from "@/components/invoices/invoice-view-model";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

const note = "Customer will pick up the parcel from Moulvibazar.\nGate code 4412.";

const model = buildInvoiceViewModel({
    trackID: "16398",
    create_date: "26-Oct-26",
    status: "due",
    note,
    total_amount: 2200,
    discount: 0,
    line_total_discount: 0,
    after_discount_amount: 2260,
    amount_paid: 0,
    amount_due: 2260,
    client: {
        name: "Mijanur Rahman Chowdhury",
        current_address: "Sunargoan PO-Munshi Bazar",
        phone: "01738110896",
    },
    lines: [
        { description: "Baby Hijab Lavender", quantity: 1, amount: 590, total_amount: 590, discount: 0 },
        { description: "Red pookie flannel set", quantity: 2, amount: 805, total_amount: 1610, discount: 0 },
    ],
}, {
    company: "Muniba & Mom",
    address: "Banasree, Dhaka",
    phone: "01877 688 699",
});

describe("InvoiceViewDocument", () => {
    it("shows the invoice, the full note, and the payable total", () => {
        expect(model).not.toBeNull();
        if (!model) return;

        render(<InvoiceViewDocument model={model} />);

        expect(screen.getByRole("heading", { name: "invoice.view.heading" })).toBeInTheDocument();
        expect(screen.getByText("16398")).toBeInTheDocument();
        expect(screen.getByText("Baby Hijab Lavender")).toBeInTheDocument();
        expect(screen.getByText("Red pookie flannel set")).toBeInTheDocument();
        expect(screen.getAllByText("Muniba & Mom").length).toBeGreaterThan(0);
        expect(screen.getByText("Mijanur Rahman Chowdhury")).toBeInTheDocument();
        expect(screen.getAllByText(formatInvoiceAmount(2260)).length).toBeGreaterThan(0);
        expect(document.querySelector("[data-invoice-note]")?.textContent).toBe(note);
        expect(screen.getByText("invoice.note.label:")).toBeInTheDocument();
        expect(screen.queryByText("invoice.discount.label")).not.toBeInTheDocument();
    });

    it("omits the note block when the invoice has no note", () => {
        const withoutNote = buildInvoiceViewModel({
            trackID: "10",
            status: "paid",
            total_amount: 100,
            after_discount_amount: 80,
            discount: 20,
            amount_paid: 80,
            amount_due: 0,
            lines: [{ description: "Package", quantity: 1, amount: 100, total_amount: 100, discount: 0 }],
        }, { company: "ISP" });

        expect(withoutNote).not.toBeNull();
        if (!withoutNote) return;

        render(<InvoiceViewDocument model={withoutNote} />);

        expect(screen.queryByText("invoice.note.label:")).not.toBeInTheDocument();
        expect(document.querySelector("[data-invoice-note]")).toBeNull();
        expect(screen.getByText("invoice.discount.label")).toBeInTheDocument();
        expect(screen.getByText(formatInvoiceAmount(20))).toBeInTheDocument();
    });
});

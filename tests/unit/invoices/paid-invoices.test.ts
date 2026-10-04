import { describe, expect, it } from "vitest";
import { toPaidInvoices } from "@/components/invoices/invoice-type";

const invoiceResource = (overrides: Record<string, unknown> = {}) => ({
    id: "0195a3c0-uuid",
    total_amount: "1000",
    after_discount_amount: 900,
    amount_paid: 900,
    amount_due: 0,
    trackID: "INV-1",
    status: "paid",
    client: { id: 7, uuid: "c-uuid", name: "Rahim", phone: "017", status: 1 },
    invoice_type: { id: 2, name: "Monthly" },
    lines: [{ description: "Internet", amount: 0, quantity: 1, total_amount: 0, discount: 0 }],
    ...overrides,
});

describe("toPaidInvoices", () => {
    it("maps the response uuid and keeps invoices with zero-amount lines", () => {
        const [invoice] = toPaidInvoices([invoiceResource()]);
        expect(invoice.uuid).toBe("0195a3c0-uuid");
        expect(invoice.status).toBe("paid");
        expect(invoice.lines).toHaveLength(1);
    });

    it("accepts a wrapped { data: [] } response", () => {
        expect(toPaidInvoices({ data: [invoiceResource()] })).toHaveLength(1);
    });

    it("excludes invoices that are still due", () => {
        const result = toPaidInvoices([invoiceResource(), invoiceResource({ id: "b", status: "due" })]);
        expect(result.map((invoice) => invoice.uuid)).toEqual(["0195a3c0-uuid"]);
    });

    it("returns an empty list for unexpected responses", () => {
        expect(toPaidInvoices(null)).toEqual([]);
        expect(toPaidInvoices("oops")).toEqual([]);
    });
});

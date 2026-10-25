import { describe, expect, it } from "vitest";
import {
    InvoiceFormSchema,
    MYSQL_TEXT_MAX_BYTES,
    invoiceNoteFitsMysqlText,
} from "@/components/invoices/invoice-type";

const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;

const validInvoice = (note: string) => ({
    create_date: "2026-01-01",
    due_date: "2026-01-15",
    invoice_type_id: 1,
    client_id: 1,
    lines: [{ description: "Internet", amount: 100, quantity: 1, discount: 0 }],
    note,
});

const noteIssue = (note: string) => {
    const result = InvoiceFormSchema.safeParse(validInvoice(note));
    if (result.success) return undefined;
    return result.error.issues.find((issue) => issue.path[0] === "note");
};

describe("invoice note mysql text limit", () => {
    it("accepts a note at the byte limit, including one past the old 500 character cap", () => {
        const note = "a".repeat(MYSQL_TEXT_MAX_BYTES);
        expect(utf8Bytes(note)).toBe(65535);
        expect(invoiceNoteFitsMysqlText(note)).toBe(true);

        const result = InvoiceFormSchema.safeParse(validInvoice(note));
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.note).toBe(note);

        expect(InvoiceFormSchema.safeParse(validInvoice("a".repeat(501))).success).toBe(true);
    });

    it("accepts a multibyte note that fills the column exactly", () => {
        const note = "ক".repeat(21845);
        expect(note.length).toBeLessThan(65535);
        expect(utf8Bytes(note)).toBe(65535);
        expect(InvoiceFormSchema.safeParse(validInvoice(note)).success).toBe(true);
    });

    it("rejects notes whose utf-8 size exceeds 65535 bytes", () => {
        const ascii = "a".repeat(MYSQL_TEXT_MAX_BYTES + 1);
        expect(noteIssue(ascii)?.message).toBe("invoice.note.errors.max_bytes");

        const bengali = "ক".repeat(21846);
        expect(bengali.length).toBeLessThan(65535);
        expect(utf8Bytes(bengali)).toBe(65538);
        expect(noteIssue(bengali)?.message).toBe("invoice.note.errors.max_bytes");
    });

    it("allows an empty note", () => {
        expect(invoiceNoteFitsMysqlText("")).toBe(true);
        expect(invoiceNoteFitsMysqlText(null)).toBe(true);
        expect(InvoiceFormSchema.safeParse(validInvoice("")).success).toBe(true);
    });
});

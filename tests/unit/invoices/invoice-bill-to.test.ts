import { describe, expect, it } from "vitest";
import { InvoiceFormSchema } from "@/components/invoices/invoice-type";
import { buildInvoiceViewModel } from "@/components/invoices/invoice-view-model";
import {
    resellerBillDue,
    resellerBillIsUnpaid,
    resellerBillPaySchema,
} from "@/components/reseller-bills/reseller-bill-type";

const baseInvoice = {
    create_date: "2026-01-01",
    due_date: "2026-01-15",
    invoice_type_id: 1,
    confirmation_sms: 1,
    lines: [{ description: "Bandwidth", amount: 100, quantity: 2, discount: 0 }],
};

const issuePaths = (input: Record<string, unknown>): string[] => {
    const result = InvoiceFormSchema.safeParse(input);
    return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
};

describe("invoice payer (bill to)", () => {
    // ক্লায়েন্টের ইনভয়েস আগের মতোই শুধু client_id দিয়ে পাঠানো হয়, নতুন payer ফিল্ড যোগ হয় না — তা যাচাই করি।
    it("Invoice form - Client payer: sends client_id and no payer fields, as before", () => {
        const withoutType = InvoiceFormSchema.parse({ ...baseInvoice, client_id: 7 });
        const withType = InvoiceFormSchema.parse({ ...baseInvoice, client_id: 7, bill_to_type: "client", bill_to_id: 9 });

        for (const payload of [withoutType, withType]) {
            expect(payload.client_id).toBe(7);
            expect(payload.confirmation_sms).toBe(1);
            expect(payload).not.toHaveProperty("bill_to_type");
            expect(payload).not.toHaveProperty("bill_to_id");
        }
    });

    // ক্লায়েন্ট payer হলে ক্লায়েন্ট বাছাই বাধ্যতামূলক থাকে — তা যাচাই করি।
    it("Invoice form - Client payer: reports the client as required when none is chosen", () => {
        expect(issuePaths({ ...baseInvoice, client_id: 0 })).toEqual(["client_id"]);
        expect(issuePaths({ ...baseInvoice })).toEqual(["client_id"]);
    });

    // রিসেলারের ইনভয়েসে রিসেলার পাঠানো হয়, ক্লায়েন্ট ও ক্লায়েন্ট SMS বাদ যায় — তা যাচাই করি।
    it("Invoice form - Reseller payer: sends the reseller, no client and no confirmation SMS", () => {
        const payload = InvoiceFormSchema.parse({
            ...baseInvoice,
            client_id: 7,
            bill_to_type: "reseller",
            bill_to_id: "12",
        });

        expect(payload).toMatchObject({
            bill_to_type: "reseller",
            bill_to_id: 12,
            client_id: null,
            confirmation_sms: 0,
            total_amount: 200,
        });
    });

    // রিসেলার payer হলে রিসেলার বাছাই বাধ্যতামূলক, ক্লায়েন্ট নয় — তা যাচাই করি।
    it("Invoice form - Reseller payer: reports the reseller as required and does not ask for a client", () => {
        expect(issuePaths({ ...baseInvoice, bill_to_type: "reseller" })).toEqual(["bill_to_id"]);
        expect(issuePaths({ ...baseInvoice, bill_to_type: "reseller", bill_to_id: 3 })).toEqual([]);
    });

    // ইনভয়েস ভিউতে ক্লায়েন্ট না থাকলে বিল-করা রিসেলার গ্রাহক হিসেবে দেখায় — তা যাচাই করি।
    it("Invoice view - Reseller payer: shows the billed reseller as the customer", () => {
        const model = buildInvoiceViewModel({
            id: "uuid-1",
            trackID: "INV9",
            total_amount: 500,
            after_discount_amount: 500,
            client: null,
            bill_to_type: "reseller",
            bill_to: { type: "reseller", id: 3, name: "North Net", phone: "01700000000", address: "Sylhet" },
        }, { company: "Main ISP", address: "Dhaka", phone: "01800000000" });

        expect(model).toMatchObject({
            customerName: "North Net",
            customerPhone: "01700000000",
            customerAddress: "Sylhet",
            customerCode: null,
            merchantName: "Main ISP",
            merchantAddress: "Dhaka",
        });
    });

    // ক্লায়েন্ট ইনভয়েসে bill_to থাকলেও গ্রাহক তথ্য ক্লায়েন্ট থেকেই আসে — তা যাচাই করি।
    it("Invoice view - Client payer: keeps the client as the customer", () => {
        const model = buildInvoiceViewModel({
            trackID: "INV10",
            client: { id: 1, name: "Rahim", sid: "C-1", phone: "01900000000", current_address: "Banani" },
            bill_to_type: "client",
            bill_to: { type: "client", id: 1, name: "Rahim" },
        });

        expect(model).toMatchObject({ customerName: "Rahim", customerCode: "C-1", customerAddress: "Banani" });
    });

    // রিসেলারের নিজের বিলে বিক্রেতা হিসেবে ইস্যুকারী কোম্পানি দেখায়, রিসেলারের নিজের সেটিংস নয় — তা যাচাই করি।
    it("Invoice view - My bills: shows the issuer as the merchant instead of the reader's own settings", () => {
        const model = buildInvoiceViewModel({
            trackID: "INV11",
            bill_to: { type: "reseller", id: 3, name: "North Net" },
            issuer: { name: "Main ISP", phone: "01800000000", address: "Dhaka" },
        }, { company: "North Net", address: "Sylhet", phone: "01700000000" });

        expect(model).toMatchObject({
            merchantName: "Main ISP",
            merchantAddress: "Dhaka",
            merchantPhone: "01800000000",
            customerName: "North Net",
        });
    });
});

describe("reseller bill wallet payment", () => {
    // বিলের বাকি হিসাব ও পরিশোধযোগ্য কি না তা যাচাই করি।
    it("My bills - Due amount: uses the API due, else total less paid, and marks paid bills as not payable", () => {
        expect(resellerBillDue({ amount_due: 300, after_discount_amount: 1000, amount_paid: 100 })).toBe(300);
        expect(resellerBillDue({ after_discount_amount: 1000, amount_paid: 400 })).toBe(600);
        expect(resellerBillIsUnpaid({ status: "partial", amount_due: 600 })).toBe(true);
        expect(resellerBillIsUnpaid({ status: "paid", amount_due: 0 })).toBe(false);
    });

    // খালি পরিমাণে সম্পূর্ণ বাকি পরিশোধ হয়, তাই amount পাঠানো হয় না — তা যাচাই করি।
    it("My bills - Pay from wallet: sends no amount for a full payment and trims an empty note", () => {
        expect(resellerBillPaySchema(500).parse({ amount: "", note: "  " })).toEqual({});
        expect(resellerBillPaySchema(500).parse({ amount: "200", note: " October " })).toEqual({
            amount: 200,
            note: "October",
        });
    });

    // বাকির বেশি, শূন্য বা ভগ্নাংশ আংশিক পরিমাণ গ্রহণ করা হয় না; পূর্ণ বাকি ভগ্নাংশ হলেও চলে — তা যাচাই করি।
    it("My bills - Pay from wallet: rejects zero, more than the due and a fractional part payment", () => {
        const schema = resellerBillPaySchema(500.5);

        expect(schema.safeParse({ amount: 0 }).success).toBe(false);
        expect(schema.safeParse({ amount: 600 }).success).toBe(false);
        expect(schema.safeParse({ amount: 200.25 }).success).toBe(false);
        expect(schema.safeParse({ amount: 500.5 }).success).toBe(true);
    });
});

import { describe, expect, it } from "vitest";
import {
    buildInvoiceViewModel,
    formatInvoiceAmount,
    formatInvoiceCount,
    formatInvoiceDigits,
} from "@/components/invoices/invoice-view-model";

const settings = {
    company: "Muniba & Mom",
    address: "House-16, Road-4, Block-A, Banasree, Dhaka",
    phone: "01877 688 699",
};

describe("buildInvoiceViewModel", () => {
    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «maps invoice fields and keeps the full note»।
    it("Invoice view model: maps invoice fields and keeps the full note", () => {
        const note = `Customer will pick up the parcel from Moulvibazar.\n${"Additional delivery instruction. ".repeat(20)}END`;
        const model = buildInvoiceViewModel({
            id: "uuid-1",
            trackID: "16398",
            create_date: "2026-10-26",
            due_date: "2026-11-02",
            status: "due",
            note,
            total_amount: 2200,
            discount: 0,
            line_total_discount: 0,
            after_discount_amount: 2260,
            amount_paid: 0,
            amount_due: 2260,
            invoice_type: { id: 1, name: "Monthly" },
            client: {
                id: 4,
                sid: "501",
                name: "Mijanur Rahman Chowdhury (Farhana Chowdhury)",
                current_address: "Sunargoan PO-Munshi Bazar, Kamalganj, MoulviBazar",
                phone: "01738110896",
            },
            zone: { id: 2, name: "Kamalganj" },
            lines: [
                { uuid: "l1", description: "Baby Hijab Lavender Slub Cotton M12T3 - 1-7 Years", quantity: 1, amount: 590, total_amount: 590, discount: 0 },
                { uuid: "l2", description: "Baby Hijab Lavender Slub Cotton M12T3 - 8-12 Years", quantity: 1, amount: 670, total_amount: 670, discount: 0 },
                { description: "Red pookie flannel top-pant set M24T2 - 10-12", quantity: 1, amount: 940, total_amount: 940, discount: 40 },
            ],
        }, settings, "http://api.isp.test/uploads/files/company/logo.png");

        expect(model).not.toBeNull();
        expect(model?.invoiceNumber).toBe("16398");
        expect(model?.invoiceDate).toBe("26-10-2026");
        expect(model?.dueDate).toBe("02-11-2026");
        expect(model?.note).toBe(note);
        expect(model?.note?.endsWith("END")).toBe(true);
        expect(model?.lines).toHaveLength(3);
        expect(model?.lines[2]?.discount).toBe(40);
        expect(model?.totalQuantity).toBe(3);
        expect(model?.subTotal).toBe(2200);
        expect(model?.total).toBe(2260);
        expect(model?.amountDue).toBe(2260);
        expect(model?.customerName).toContain("Farhana Chowdhury");
        expect(model?.customerPhone).toBe("01738110896");
        expect(model?.customerZone).toBe("Kamalganj");
        expect(model?.merchantName).toBe("Muniba & Mom");
        expect(model?.merchantPhone).toBe("01877 688 699");
        expect(model?.merchantLogoUrl).toBe("http://api.isp.test/uploads/files/company/logo.png");
        expect(model?.invoiceType).toBe("Monthly");
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «omits a blank note and reads list line items»।
    it("Invoice view model: omits a blank note and reads list line items", () => {
        const model = buildInvoiceViewModel({
            uuid: "uuid-2",
            trackID: "INV-2",
            status: "paid",
            note: "   ",
            total_amount: 500,
            after_discount_amount: 450,
            discount: 50,
            amount_paid: 450,
            invoice_lines: [
                { description: "Internet package", quantity: 2, amount: 250, total_amount: 500, discount: 0 },
            ],
            client: { name: "Karim" },
            reseller: {
                company: "Reseller ISP",
                company_address: "Sylhet",
                company_phone: "01700000000",
            },
        }, settings);

        expect(model?.note).toBeNull();
        expect(model?.lines[0]?.description).toBe("Internet package");
        expect(model?.lines[0]?.quantity).toBe(2);
        expect(model?.merchantName).toBe("Reseller ISP");
        expect(model?.merchantAddress).toBe("Sylhet");
        expect(model?.merchantPhone).toBe("01700000000");
        expect(model?.discount).toBe(50);
        expect(model?.amountDue).toBe(0);
        expect(model?.total).toBe(450);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «formats amounts and quantities in Bangla digits»।
    it("Invoice view model: formats amounts and quantities in Bangla digits", () => {
        expect(formatInvoiceAmount(2260)).toBe("2,260৳");
        expect(formatInvoiceAmount(2260, "bn")).toBe("২,২৬০৳");
        expect(formatInvoiceAmount(100000, "bn")).toBe("১,০০,০০০৳");
        expect(formatInvoiceCount(2)).toBe("2");
        expect(formatInvoiceCount(2, "bn")).toBe("২");
        expect(formatInvoiceDigits("134")).toBe("134");
        expect(formatInvoiceDigits("134", "bn")).toBe("১৩৪");
        expect(formatInvoiceDigits("501-12", "bn")).toBe("৫০১-১২");
    });

    // অগ্রিম থেকে পুরো মিটে যাওয়া 1400 টাকার বিলে পুরো বিল, পরিশোধ 1400, বকেয়া 0 ও হাতে থাকা অগ্রিম 600 আসে এবং বিয়োগ line বাদ যায় কি না যাচাই করি।
    it("Invoice view model - 1400 bill covered by the advance: shows the full bill as paid and 600 advance in hand", () => {
        const model = buildInvoiceViewModel({
            trackID: "INV-20",
            total_amount: 0,
            discount: 0,
            line_total_discount: 0,
            after_discount_amount: 0,
            amount_paid: 0,
            amount_due: 0,
            advance_amount: 1400,
            wallet_balance: 600,
            lines: [
                { description: "Internet bill", amount: 1400, quantity: 1, total_amount: 1400 },
                { description: "Advance payment adjusted", amount: -1400, quantity: 1, total_amount: -1400 },
            ],
        });

        expect(model?.subTotal).toBe(1400);
        expect(model?.total).toBe(1400);
        expect(model?.amountPaid).toBe(1400);
        expect(model?.amountDue).toBe(0);
        expect(model?.advanceInHand).toBe(600);
        expect(model?.lines.map((line) => line.description)).toEqual(["Internet bill"]);
    });

    // অগ্রিম আংশিক (500) হলে বিল 1400, পরিশোধ 500, বকেয়া 900 আসে কি না যাচাই করি।
    it("Invoice view model - advance covers 500 of 1400: shows paid 500 and due 900", () => {
        const model = buildInvoiceViewModel({
            trackID: "INV-21",
            total_amount: 900,
            after_discount_amount: 900,
            amount_paid: 0,
            amount_due: 900,
            advance_amount: 500,
            wallet_balance: 0,
            lines: [
                { description: "Internet bill", amount: 1400, quantity: 1, total_amount: 1400 },
                { description: "Advance payment adjusted", amount: -500, quantity: 1, total_amount: -500 },
            ],
        });

        expect(model?.total).toBe(1400);
        expect(model?.amountPaid).toBe(500);
        expect(model?.amountDue).toBe(900);
        expect(model?.advanceInHand).toBe(0);
    });

    // অগ্রিম ছাড়া সাধারণ বিলের অঙ্ক আগের মতোই থাকে কি না যাচাই করি।
    it("Invoice view model - ordinary bill: keeps its amounts and has no advance in hand", () => {
        const model = buildInvoiceViewModel({
            trackID: "INV-22",
            total_amount: 500,
            after_discount_amount: 500,
            amount_paid: 200,
            lines: [{ description: "Internet bill", amount: 500, quantity: 1, total_amount: 500 }],
        });

        expect(model?.total).toBe(500);
        expect(model?.amountPaid).toBe(200);
        expect(model?.amountDue).toBe(300);
        expect(model?.advanceInHand).toBe(0);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «returns null when the payload is not an invoice»।
    it("Invoice view model: returns null when the payload is not an invoice", () => {
        expect(buildInvoiceViewModel(null)).toBeNull();
        expect(buildInvoiceViewModel({})).toBeNull();
    });
});

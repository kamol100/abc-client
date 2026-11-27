import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InvoiceReceipt, { getInvoiceTotals } from "@/components/invoices/invoice-receipt";
import { DEFAULT_INVOICE_PRINT_SETTINGS } from "@/components/invoices/invoice-print-config";
import type { InvoiceDetail } from "@/components/invoices/invoice-type";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/context/app-provider", () => ({
    useSettings: () => ({ settings: { company: "VP Net", support_phone: "09666777888" } }),
}));

const client = { id: 1, uuid: "client-1", sid: 99, name: "Kamal", phone: "01700000000", pppoe_username: "kamal01" };

/** A 900 bill after `paid` in all, the newest payment being `last`. */
const bill = (paid: number, last: number, extra: Partial<InvoiceDetail> = {}) => ({
    id: 10,
    trackID: "INV10",
    total_amount: 900,
    discount: 0,
    line_total_discount: 0,
    total_discount: 0,
    after_discount_amount: 900,
    amount_paid: paid,
    amount_due: 900 - paid,
    last_payment_amount: last,
    client,
    lines: [{ description: "Internet bill", amount: 900, quantity: 1, total_amount: 900, discount: 0 }],
    ...extra,
}) as InvoiceDetail;

const basic = { ...DEFAULT_INVOICE_PRINT_SETTINGS, mode: "basic" as const, show_total_amount_in_words: true };
const advanced = { ...DEFAULT_INVOICE_PRINT_SETTINGS, mode: "advanced" as const, show_total_amount_in_words: true };

const rowValue = (label: string) => screen.getByText(label).parentElement?.lastElementChild?.textContent;

describe("Invoice receipt for the newest payment", () => {
    // 900 টাকার বিলে 200 + 200 দুইবার আংশিক পরিশোধের পর basic print-এ মোট বিল 700, পরিশোধ 200, বকেয়া 500 দেখায় কি না যাচাই করি।
    it("Basic print, 900 bill after two payments of 200: shows bill 700, paid 200, due 500", () => {
        render(<InvoiceReceipt invoices={[bill(400, 200)]} printSettings={basic} />);

        expect(rowValue("invoice.receipt.total_bill")).toBe("700.00");
        expect(rowValue("invoice.receipt.paid_and_discount")).toBe("200.00");
        expect(rowValue("invoice.receipt.total_due")).toBe("500.00");
        // কথায় লেখা টাকা সবসময় "পরিশোধ ও ছাড়"-এর সমান।
        expect(screen.getByText("Two Hundred invoice.receipt.taka.")).toBeInTheDocument();
    });

    // এরপর 300 টাকা দিলে মোট বিল 500, পরিশোধ 300, বকেয়া 200 দেখায় কি না যাচাই করি।
    it("Basic print, a third payment of 300: shows bill 500, paid 300, due 200", () => {
        render(<InvoiceReceipt invoices={[bill(700, 300)]} printSettings={basic} />);

        expect(rowValue("invoice.receipt.total_bill")).toBe("500.00");
        expect(rowValue("invoice.receipt.paid_and_discount")).toBe("300.00");
        expect(rowValue("invoice.receipt.total_due")).toBe("200.00");
        expect(screen.getByText("Three Hundred invoice.receipt.taka.")).toBeInTheDocument();
    });

    // প্রথম পরিশোধে পুরো বিল দেখায় এবং ছাড় "পরিশোধ ও ছাড়"-এ যোগ হয়; পরের পরিশোধে ছাড় আর যোগ হয় না, যাচাই করি।
    it("Bill of 1000 with 100 discount: counts the discount with the first payment only", () => {
        const discounted = (paid: number, last: number) => bill(paid, last, {
            total_amount: 1000,
            line_total_discount: 100,
            total_discount: 100,
            after_discount_amount: 900,
            amount_due: 900 - paid,
        });

        const first = getInvoiceTotals(discounted(200, 200));
        expect(first.currentBill).toBe(1000);
        expect(first.currentPaid + first.currentDiscount).toBe(300);
        expect(first.amountDue).toBe(700);

        const second = getInvoiceTotals(discounted(400, 200));
        expect(second.currentBill).toBe(700);
        expect(second.currentPaid + second.currentDiscount).toBe(200);
        expect(second.amountDue).toBe(500);
    });

    // কোনো পরিশোধ না থাকলে পুরো বিল ও পুরো বকেয়া দেখায় কি না যাচাই করি।
    it("Unpaid bill: shows the whole bill as due", () => {
        render(<InvoiceReceipt invoices={[bill(0, 0)]} printSettings={basic} />);

        expect(rowValue("invoice.receipt.total_bill")).toBe("900.00");
        expect(rowValue("invoice.receipt.paid_and_discount")).toBe("0.00");
        expect(rowValue("invoice.receipt.total_due")).toBe("900.00");
    });

    // অগ্রিম 500 কাটা 1400 টাকার বিলে পরে নগদ 400 দিলে অগ্রিম আগের পরিশোধ হিসেবে গোনা হয়: বিল 900, পরিশোধ 400, বকেয়া 500, যাচাই করি।
    it("1400 bill with 500 advance, then 400 cash: shows bill 900, paid 400, due 500", () => {
        const totals = getInvoiceTotals(bill(400, 400, {
            total_amount: 900,
            after_discount_amount: 900,
            advance_amount: 500,
            amount_due: 500,
        }));

        expect(totals.currentBill).toBe(900);
        expect(totals.currentPaid).toBe(400);
        expect(totals.previousPaid).toBe(500);
        expect(totals.amountDue).toBe(500);
    });

    // Advanced print-এ item 900 থাকে, "আগে পরিশোধিত 200" লাইন আসে, মোট 700, পরিশোধ 200, বকেয়া 500 দেখায় কি না যাচাই করি।
    it("Advanced print, 900 bill after two payments of 200: shows previous paid 200, total 700, paid 200, due 500", () => {
        render(<InvoiceReceipt invoices={[bill(400, 200)]} printSettings={advanced} />);

        expect(rowValue("invoice.receipt.sub_total:")).toBe("900");
        expect(rowValue("invoice.receipt.previous_paid:")).toBe("200");
        expect(rowValue("invoice.receipt.total:")).toBe("700");
        expect(rowValue("invoice.receipt.paid:")).toBe("200");
        expect(rowValue("invoice.receipt.due:")).toBe("500");
        expect(screen.getByText("Two Hundred invoice.receipt.only")).toBeInTheDocument();
    });

    // প্রথম পরিশোধের advanced print-এ "আগে পরিশোধিত" লাইন থাকে না, যাচাই করি।
    it("Advanced print, first payment: has no previous paid row", () => {
        render(<InvoiceReceipt invoices={[bill(200, 200)]} printSettings={advanced} />);

        expect(screen.queryByText("invoice.receipt.previous_paid:")).not.toBeInTheDocument();
        expect(rowValue("invoice.receipt.total:")).toBe("900");
        expect(rowValue("invoice.receipt.paid:")).toBe("200");
    });

    // "আগে পরিশোধিত" লেখা ইংরেজি ও বাংলা দুই ফাইলেই আছে কি না যাচাই করি।
    it("Previous paid label: exists in both English and Bangla", () => {
        expect(en.invoice.receipt.previous_paid).toBeTruthy();
        expect(bn.invoice.receipt.previous_paid).toBeTruthy();
    });
});

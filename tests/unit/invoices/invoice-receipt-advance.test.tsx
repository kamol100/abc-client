import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InvoiceReceipt from "@/components/invoices/invoice-receipt";
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

/** A 1400 bill fully covered by the advance; the client recharged 2000, so 600 is left. */
const adjusted = {
    id: 20,
    trackID: "INV-20",
    total_amount: 0,
    discount: 0,
    line_total_discount: 0,
    total_discount: 0,
    after_discount_amount: 0,
    amount_paid: 0,
    amount_due: 0,
    advance_amount: 1400,
    bill_amount: 1400,
    wallet_balance: 600,
    client,
    lines: [
        { description: "Internet bill", amount: 1400, quantity: 1, total_amount: 1400, discount: 0 },
        { description: "Advance payment adjusted", amount: -1400, quantity: 1, total_amount: -1400, discount: 0 },
    ],
} as InvoiceDetail;

const basic = { ...DEFAULT_INVOICE_PRINT_SETTINGS, mode: "basic" as const };
const advanced = { ...DEFAULT_INVOICE_PRINT_SETTINGS, mode: "advanced" as const };

/** The amount printed on the row with this label. */
const rowValue = (label: string) => screen.getByText(label).parentElement?.lastElementChild?.textContent;

describe("Invoice receipt with an advance", () => {
    // অগ্রিম থেকে পুরো মিটে যাওয়া বিলের basic print-এ মোট বিল 1400, পরিশোধ 1400, বকেয়া 0 ও হাতে থাকা অগ্রিম 600 দেখায় কি না যাচাই করি।
    it("Basic print, 1400 bill covered by the advance: shows bill 1400, paid 1400, due 0 and 600 advance in hand", () => {
        render(<InvoiceReceipt invoices={[adjusted]} printSettings={basic} />);

        expect(rowValue("invoice.receipt.total_bill")).toBe("1,400.00");
        expect(rowValue("invoice.receipt.paid_and_discount")).toBe("1,400.00");
        expect(rowValue("invoice.receipt.total_due")).toBe("0.00");
        expect(rowValue("invoice.receipt.advance_in_hand")).toBe("600.00");
    });

    // Advanced print-এ একই হিসাব দেখায় এবং অগ্রিমের বিয়োগ line item হিসেবে ছাপে না, যাচাই করি।
    it("Advanced print, same bill: shows the same sums and leaves the minus line out of the items", () => {
        render(<InvoiceReceipt invoices={[adjusted]} printSettings={advanced} />);

        expect(rowValue("invoice.receipt.sub_total:")).toBe("1,400");
        expect(rowValue("invoice.receipt.total:")).toBe("1,400");
        expect(rowValue("invoice.receipt.paid:")).toBe("1,400");
        expect(screen.queryByText("invoice.receipt.due:")).not.toBeInTheDocument();
        expect(rowValue("invoice.receipt.advance_in_hand:")).toBe("600");
        expect(screen.getByText("INV-20: Internet bill 1x1,400")).toBeInTheDocument();
        expect(screen.queryByText(/Advance payment adjusted/)).not.toBeInTheDocument();
    });

    // অগ্রিম আংশিক (500) হলে বিল 1400, পরিশোধ 500 ও বকেয়া 900 দেখায় এবং wallet খালি বলে অগ্রিমের লাইন থাকে না, যাচাই করি।
    it("Basic print, advance covers 500 of 1400: shows paid 500, due 900 and no advance in hand", () => {
        const partly = {
            ...adjusted,
            total_amount: 900,
            after_discount_amount: 900,
            amount_due: 900,
            advance_amount: 500,
            wallet_balance: 0,
        } as InvoiceDetail;
        render(<InvoiceReceipt invoices={[partly]} printSettings={basic} />);

        expect(rowValue("invoice.receipt.total_bill")).toBe("1,400.00");
        expect(rowValue("invoice.receipt.paid_and_discount")).toBe("500.00");
        expect(rowValue("invoice.receipt.total_due")).toBe("900.00");
        expect(screen.queryByText("invoice.receipt.advance_in_hand")).not.toBeInTheDocument();
    });

    // সাধারণ বিলেও client-এর wallet-এ টাকা থাকলে হাতে থাকা অগ্রিম ছাপে, এবং একই client-এর দুই invoice-এ তা একবারই গোনা হয়, যাচাই করি।
    it("Two ordinary invoices of one client with 300 in the wallet: prints 300 advance in hand once", () => {
        const ordinary = (id: number) => ({
            id,
            trackID: `INV-${id}`,
            total_amount: 500,
            after_discount_amount: 500,
            amount_paid: 500,
            amount_due: 0,
            wallet_balance: 300,
            client,
            lines: [{ description: "Internet bill", amount: 500, quantity: 1, total_amount: 500, discount: 0 }],
        }) as InvoiceDetail;
        render(<InvoiceReceipt invoices={[ordinary(31), ordinary(32)]} printSettings={basic} />);

        expect(rowValue("invoice.receipt.total_bill")).toBe("1,000.00");
        expect(rowValue("invoice.receipt.advance_in_hand")).toBe("300.00");
    });

    // হাতে থাকা অগ্রিমের লেখা ইংরেজি ও বাংলা দুই ফাইলেই আছে কি না যাচাই করি।
    it("Advance in hand label: exists in both English and Bangla", () => {
        expect(en.invoice.receipt.advance_in_hand).toBeTruthy();
        expect(bn.invoice.receipt.advance_in_hand).toBeTruthy();
    });
});

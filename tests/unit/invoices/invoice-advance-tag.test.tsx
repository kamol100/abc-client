import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import InvoiceAdvanceTag, { invoiceAdvance } from "@/components/invoices/invoice-advance-tag";
import { InvoiceRowSchema } from "@/components/invoices/invoice-type";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

describe("Invoice advance tag", () => {
    // 1400 টাকার বিল পুরোটা অগ্রিম থেকে মিটলে বিল 1400, অগ্রিম 1400, পরিশোধযোগ্য 0 হিসাব আসে কি না যাচাই করি।
    it("Bill of 1400 fully covered by the advance: gives bill 1400, advance 1400, to pay 0", () => {
        const row = InvoiceRowSchema.parse({ after_discount_amount: 0, advance_amount: 1400, bill_amount: 1400 });

        expect(invoiceAdvance(row)).toEqual({ bill: 1400, advance: 1400, payable: 0 });
    });

    // অগ্রিম আংশিক হলে এবং API-তে bill_amount না থাকলে বাকি + অগ্রিম যোগ করে বিল বের হয় কি না যাচাই করি।
    it("Advance covers part and bill_amount is missing: works the bill out from what is left", () => {
        const row = InvoiceRowSchema.parse({ after_discount_amount: 900, advance_amount: 500 });

        expect(invoiceAdvance(row)).toEqual({ bill: 1400, advance: 500, payable: 900 });
    });

    // অগ্রিম ব্যবহার না হলে কোনো tag আসে না, যাচাই করি।
    it("Bill with no advance: gives nothing to show", () => {
        expect(invoiceAdvance({ after_discount_amount: 1400, advance_amount: 0 })).toBeNull();
        expect(invoiceAdvance({ after_discount_amount: 1400 })).toBeNull();
    });

    // Tag-এ hover/focus করলে মোট বিল, অগ্রিম ও পরিশোধযোগ্য টাকার হিসাব tooltip-এ দেখায় কি না যাচাই করি।
    it("Tag focused: shows the total bill, the advance paid and what is left to pay", async () => {
        const user = userEvent.setup();
        render(<InvoiceAdvanceTag bill={1400} advance={1400} payable={0} />);

        expect(screen.getByText("invoice.advance.tag")).toBeVisible();
        await user.tab();

        const tooltip = await screen.findByRole("tooltip");
        expect(tooltip).toHaveTextContent("invoice.advance.total_bill");
        expect(tooltip).toHaveTextContent("৳1,400");
        expect(tooltip).toHaveTextContent("invoice.advance.advance_paid");
        expect(tooltip).toHaveTextContent("− ৳1,400");
        expect(tooltip).toHaveTextContent("invoice.advance.to_pay");
        expect(tooltip).toHaveTextContent("৳0");
    });

    // "note" রূপে ট্যাগের বদলে অগ্রিমের পরিমাণ লেখা দেখায় এবং focus করলে একই হিসাবের tooltip আসে কি না যাচাই করি।
    it("Note variant focused: shows the advance amount as text and the same breakdown", async () => {
        const user = userEvent.setup();
        render(<InvoiceAdvanceTag bill={1400} advance={500} payable={900} variant="note" />);

        expect(screen.getByText(/invoice\.reports\.advance_payment/)).toHaveTextContent(/:500$/);
        expect(screen.queryByText("invoice.advance.tag")).not.toBeInTheDocument();
        await user.tab();

        const tooltip = await screen.findByRole("tooltip");
        expect(tooltip).toHaveTextContent("invoice.advance.total_bill");
        expect(tooltip).toHaveTextContent("৳900");
    });

    // Tag ও tooltip-এর লেখা ইংরেজি ও বাংলা দুই ফাইলেই আছে কি না যাচাই করি।
    it("Advance tag labels: exist in both English and Bangla", () => {
        for (const lang of [en, bn]) {
            expect(lang.invoice.advance.tag).toBeTruthy();
            expect(lang.invoice.advance.total_bill).toBeTruthy();
            expect(lang.invoice.advance.advance_paid).toBeTruthy();
            expect(lang.invoice.advance.to_pay).toBeTruthy();
        }
    });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InvoiceReports, { invoiceReportsDue } from "@/components/invoices/invoice-reports";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

describe("InvoiceReports", () => {
    // ইনভয়েসের মোট হিসাবের শেষে ডিউ চিপ থাকে এবং তাতে মোট (ডিসকাউন্টের পর) থেকে পরিশোধিত বাদ দিয়ে বাকি টাকা দেখায় কি না যাচাই করি।
    it("Invoice totals: shows a due chip after paid with the total after discount minus the paid amount", () => {
        render(
            <InvoiceReports
                reports={{ total_amount: 1300, discount: 100, after_discount_amount: 1200, amount_paid: 450 }}
            />,
        );

        const labels = screen.getAllByRole("term").map((term) => term.textContent);
        expect(labels).toEqual([
            "invoice.reports.sub_total",
            "invoice.reports.discount",
            "invoice.reports.total",
            "invoice.reports.paid",
            "invoice.reports.due",
        ]);

        const due = screen.getAllByRole("definition")[4];
        expect(due).toHaveTextContent("750.00");
        expect(due).toHaveClass("text-destructive");
    });

    // ক্লায়েন্ট ভিউ থেকে ওয়ালেট ব্যালেন্স দিলে শেষে "Advance Payment" চিপ দেখায়, আর না দিলে চিপটি থাকে না কি না যাচাই করি।
    it("Invoice totals: shows an advance payment chip last only when the client's wallet balance is given", () => {
        const reports = { total_amount: 1300, discount: 100, after_discount_amount: 1200, amount_paid: 450 };
        const { rerender } = render(<InvoiceReports reports={reports} />);
        expect(screen.queryByText("invoice.reports.advance_payment")).not.toBeInTheDocument();
        expect(screen.getAllByRole("term")).toHaveLength(5);

        rerender(<InvoiceReports reports={reports} advancePayment={320} />);
        const terms = screen.getAllByRole("term");
        expect(terms).toHaveLength(6);
        expect(terms[5]).toHaveTextContent("invoice.reports.advance_payment");
        expect(screen.getAllByRole("definition")[5]).toHaveTextContent("320.00");

        // A client with no advance still has the chip, at zero.
        rerender(<InvoiceReports reports={reports} advancePayment={0} />);
        expect(screen.getAllByRole("definition")[5]).toHaveTextContent("0.00");
    });

    // টুলবারে জায়গা কমলে চিপগুলো এক সারিতেই থাকে: compact ও tight-এ আইকন বাদ যায়, আর grid-এ দুই কলামের গ্রিড হয় কি না যাচাই করি।
    it("Invoice totals in the toolbar: stay in one row and drop the icons when compact or tight, and use the grid only for the grid density", () => {
        const reports = { total_amount: 1300, discount: 100, after_discount_amount: 1200, amount_paid: 450 };
        const { container, rerender } = render(<InvoiceReports reports={reports} layout="toolbar" density="full" />);
        const list = () => container.querySelector("dl");
        const icons = () => container.querySelectorAll("dt svg").length;

        expect(list()).toHaveClass("flex");
        expect(list()).not.toHaveClass("grid");
        expect(icons()).toBe(5);

        for (const density of ["compact", "tight"] as const) {
            rerender(<InvoiceReports reports={reports} layout="toolbar" density={density} />);
            expect(list()).toHaveClass("flex");
            expect(icons()).toBe(0);
            expect(screen.getAllByRole("term")).toHaveLength(5);
        }

        rerender(<InvoiceReports reports={reports} layout="toolbar" density="grid" />);
        expect(list()).toHaveClass("grid", "grid-cols-2");
        expect(icons()).toBe(5);
    });

    // পরিশোধ মোটের সমান বা বেশি হলে ডিউ শূন্য থাকে, আর রিপোর্ট না থাকলেও শূন্য দেখায় কি না যাচাই করি।
    it("Invoice totals: due is zero when everything is paid, overpaid, or there are no totals", () => {
        expect(invoiceReportsDue({ total_amount: 500, discount: 0, after_discount_amount: 500, amount_paid: 500 })).toBe(0);
        expect(invoiceReportsDue({ total_amount: 500, discount: 0, after_discount_amount: 500, amount_paid: 600 })).toBe(0);
        expect(invoiceReportsDue(null)).toBe(0);
    });
});

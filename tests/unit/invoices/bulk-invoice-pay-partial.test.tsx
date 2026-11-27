import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BulkInvoicePayDialog from "@/components/invoices/bulk-invoice-pay-dialog";
import { InvoiceDueItem } from "@/components/clients/client-type";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";

const mutate = vi.hoisted(() => vi.fn());

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({ hasPermission: () => false }),
    useSetting: () => undefined,
    useProfile: () => ({
        profile: { id: "user-1", name: "Collector", status: 1, staff: { fund: { id: 4, name: "cash" } } },
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({ mutate, isPending: false }),
}));

vi.mock("@/components/invoices/invoice-print-dialog", () => ({ default: () => null }));
vi.mock("@/components/invoices/invoice-discount-dialog", () => ({ default: () => null }));

vi.mock("@/components/my-dialog", () => ({
    MyDialog: ({
        children,
        footer,
        open,
    }: {
        children: ReactNode;
        open?: boolean;
        footer?: (props: { close: () => void; loading: boolean }) => ReactNode;
    }) =>
        open ? (
            <div>
                {children}
                {typeof footer === "function" ? footer({ close: () => undefined, loading: false }) : footer}
            </div>
        ) : null,
}));

vi.mock("@/components/select-dropdown", () => ({ default: () => null }));
vi.mock("@/components/form/DatePicker", () => ({ default: () => null }));
vi.mock("@/components/form/textarea-field", () => ({ default: () => null }));

// The status choice as two plain buttons, the amount as a plain number input.
vi.mock("@/components/form/radio-field", () => ({
    default: ({ name, options }: { name: string; options: { label: string; value: string | number }[] }) => {
        const { setValue } = useFormContext();
        if (name !== "status") return null;
        return (
            <>
                {options.map((option) => (
                    <button key={option.value} type="button" onClick={() => setValue(name, option.value)}>
                        status-{option.value}
                    </button>
                ))}
            </>
        );
    },
}));

vi.mock("@/components/form/input-field", () => ({
    default: ({ name }: { name: string }) => {
        const { register } = useFormContext();
        return <input aria-label={name} type="number" {...register(name)} />;
    },
}));

/** One invoice of 1000 with 400 already paid: 600 is due. */
const invoiceDue = [
    {
        uuid: "inv-1",
        trackID: "INV-1",
        total_amount: 1000,
        after_discount_amount: 1000,
        discount: 0,
        line_total_discount: 0,
        amount_paid: 400,
    },
] as InvoiceDueItem[];

const renderDialog = () =>
    render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <BulkInvoicePayDialog invoiceDue={invoiceDue} open onOpenChange={() => undefined} />
        </QueryClientProvider>,
    );

const submitButton = () => screen.getByRole("button", { name: "invoice.bulk_pay.submit" });
const tooHigh = () => screen.queryByText("invoice.bulk_pay.partial_amount.errors.max");

describe("BulkInvoicePayDialog partial amount", () => {
    beforeEach(() => {
        mutate.mockReset();
    });

    // আংশিক পরিশোধে মোট বকেয়ার (600) চেয়ে বেশি টাকা লিখলে সাথে সাথে ত্রুটি দেখায় ও submit বন্ধ হয় কি না যাচাই করি।
    it("Partial payment above the total due: shows the error at once and disables submit", async () => {
        const user = userEvent.setup();
        renderDialog();

        await user.click(screen.getByRole("button", { name: "status-partial" }));
        await user.type(screen.getByLabelText("partial_amount"), "601");

        expect(tooHigh()).toBeVisible();
        expect(submitButton()).toBeDisabled();

        await user.click(submitButton());
        expect(mutate).not.toHaveBeenCalled();
    });

    // টাকা কমিয়ে মোট বকেয়ার সমান বা কম করলে ত্রুটি সরে যায় ও submit আবার চালু হয় কি না যাচাই করি।
    it("Partial amount lowered to the total due: clears the error and enables submit again", async () => {
        const user = userEvent.setup();
        renderDialog();

        await user.click(screen.getByRole("button", { name: "status-partial" }));
        const amount = screen.getByLabelText("partial_amount");
        await user.type(amount, "700");
        expect(submitButton()).toBeDisabled();

        await user.clear(amount);
        await user.type(amount, "600");

        expect(tooHigh()).toBeNull();
        expect(submitButton()).toBeEnabled();
    });

    // পুরো পরিশোধে ফিরে গেলে আগের বেশি লেখা আংশিক টাকার কারণে submit আটকে থাকে না, যাচাই করি।
    it("Back to full payment after a too-high partial amount: submit is enabled", async () => {
        const user = userEvent.setup();
        renderDialog();

        await user.click(screen.getByRole("button", { name: "status-partial" }));
        await user.type(screen.getByLabelText("partial_amount"), "999");
        expect(submitButton()).toBeDisabled();

        await user.click(screen.getByRole("button", { name: "status-paid" }));

        expect(tooHigh()).toBeNull();
        expect(submitButton()).toBeEnabled();
    });

    // ত্রুটির লেখা ইংরেজি ও বাংলা দুই ফাইলেই আছে কি না যাচাই করি।
    it("Too-high partial amount message: exists in both English and Bangla", () => {
        expect(en.invoice.bulk_pay.partial_amount.errors.max).toBeTruthy();
        expect(bn.invoice.bulk_pay.partial_amount.errors.max).toBeTruthy();
    });
});

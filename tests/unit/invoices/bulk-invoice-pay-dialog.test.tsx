import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BulkInvoicePayDialog from "@/components/invoices/bulk-invoice-pay-dialog";
import { InvoiceDueItem } from "@/components/clients/client-type";

const session = vi.hoisted(() => ({
    roles: ["Staff"] as unknown,
    staff: { fund: { id: 4, name: "cash" } } as {
        fund?: { id?: unknown; name?: string } | null;
    } | null,
}));

const mutate = vi.hoisted(() => vi.fn());

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: () => false,
    }),
    useSetting: (key: string) => (key === "roles" ? session.roles : undefined),
    useProfile: () => ({
        profile: {
            id: "user-1",
            name: "Collector",
            status: 1,
            staff: session.staff,
        },
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({
        mutate,
        isPending: false,
    }),
}));

vi.mock("@/components/invoices/invoice-print-dialog", () => ({
    default: () => null,
}));

vi.mock("@/components/invoices/invoice-discount-dialog", () => ({
    default: () => null,
}));

vi.mock("@/components/my-dialog", () => ({
    MyDialog: ({
        children,
        footer,
        open,
    }: {
        children: ReactNode;
        open?: boolean;
        footer?: (props: { close: () => void; loading: boolean }) => React.ReactNode;
    }) =>
        open ? (
            <div>
                {children}
                {typeof footer === "function"
                    ? footer({ close: () => undefined, loading: false })
                    : footer}
            </div>
        ) : null,
}));

vi.mock("@/components/select-dropdown", () => ({
    default: ({
        name,
        isDisabled,
        placeholder,
    }: {
        name: string;
        isDisabled?: boolean;
        placeholder?: string;
    }) => {
        const { watch, setValue } = useFormContext();
        const value = watch(name);
        const selected = value == null || value === "" ? "" : String(value);

        return (
            <select
                aria-label={name}
                disabled={Boolean(isDisabled)}
                value={selected}
                onChange={(event) => {
                    const next = event.target.value;
                    setValue(name, next === "" ? undefined : Number(next), {
                        shouldValidate: true,
                        shouldDirty: true,
                    });
                }}
            >
                <option value="">{placeholder}</option>
                <option value="4">cash</option>
                <option value="9">bank</option>
            </select>
        );
    },
}));

vi.mock("@/components/form/DatePicker", () => ({ default: () => null }));
vi.mock("@/components/form/radio-field", () => ({ default: () => null }));
vi.mock("@/components/form/textarea-field", () => ({ default: () => null }));
vi.mock("@/components/form/input-field", () => ({ default: () => null }));

const invoiceDue = [
    {
        uuid: "inv-1",
        trackID: "INV-1",
        total_amount: 100,
        after_discount_amount: 100,
        discount: 0,
        line_total_discount: 0,
        amount_paid: 0,
    },
] as InvoiceDueItem[];

const renderDialog = () => {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={client}>
            <BulkInvoicePayDialog
                invoiceDue={invoiceDue}
                open
                onOpenChange={() => undefined}
            />
        </QueryClientProvider>,
    );
};

const fundSelect = () => screen.getByLabelText("fund_id");
const submitButton = () =>
    screen.getByRole("button", { name: "invoice.bulk_pay.submit" });

describe("BulkInvoicePayDialog fund selection", () => {
    beforeEach(() => {
        mutate.mockReset();
        session.roles = ["Staff"];
        session.staff = { fund: { id: 4, name: "cash" } };
    });

    it("preselects and locks the assigned fund for a non-admin", async () => {
        const user = userEvent.setup();
        renderDialog();

        await waitFor(() => expect(fundSelect()).toHaveValue("4"));
        expect(fundSelect()).toBeDisabled();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        await user.click(submitButton());

        await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
        expect(mutate).toHaveBeenCalledWith(
            expect.objectContaining({ fund_id: 4, invoice_ids: ["inv-1"] }),
        );
    });

    it("warns and blocks payment when a non-admin has no fund", () => {
        session.staff = { fund: null };
        renderDialog();

        expect(fundSelect()).toBeDisabled();
        expect(fundSelect()).toHaveValue("");
        expect(screen.getByRole("alert")).toHaveTextContent(
            "invoice.bulk_pay.fund.errors.unassigned",
        );
        expect(submitButton()).toBeDisabled();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("lets an admin change the preselected fund and submit another fund", async () => {
        const user = userEvent.setup();
        session.roles = ["Admin"];
        renderDialog();

        await waitFor(() => expect(fundSelect()).toHaveValue("4"));
        expect(fundSelect()).toBeEnabled();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        await user.selectOptions(fundSelect(), "9");
        await user.click(submitButton());

        await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
        expect(mutate).toHaveBeenCalledWith(
            expect.objectContaining({ fund_id: 9 }),
        );
    });

    it("lets an admin submit after choosing a fund when none is assigned", async () => {
        const user = userEvent.setup();
        session.roles = ["Super Admin"];
        session.staff = null;
        renderDialog();

        expect(fundSelect()).toBeEnabled();
        expect(fundSelect()).toHaveValue("");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(submitButton()).toBeEnabled();

        await user.selectOptions(fundSelect(), "9");
        await user.click(submitButton());

        await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
        expect(mutate).toHaveBeenCalledWith(
            expect.objectContaining({ fund_id: 9 }),
        );
    });

    it("does not select a fund or show the unassigned warning while user data is missing", () => {
        session.roles = undefined;
        session.staff = { fund: { id: 9, name: "bank" } };
        renderDialog();

        expect(fundSelect()).toBeDisabled();
        expect(fundSelect()).toHaveValue("");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(submitButton()).toBeDisabled();
        expect(mutate).not.toHaveBeenCalled();
    });
});

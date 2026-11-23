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
    canChangeFund: false,
    canUseBkash: false,
    canDiscount: false,
    staff: { fund: { id: 4, name: "cash" } } as {
        fund?: { id?: unknown; name?: string } | null;
    } | null,
}));

const discountHarness = vi.hoisted(() => ({
    enabled: false,
}));

const mutate = vi.hoisted(() => vi.fn());
const fundApi = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => {
            if (name === "invoices.change-fund") return session.canChangeFund;
            if (name === "invoices.bkash-fund-access") return session.canUseBkash;
            if (name === "invoices.apply-discount") return session.canDiscount;
            return false;
        },
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
    default: ({
        onUpdated,
        onOpenChange,
    }: {
        onUpdated?: (amount: number) => void;
        onOpenChange?: (open: boolean) => void;
    }) =>
        discountHarness.enabled ? (
            <button
                type="button"
                onClick={() => {
                    onOpenChange?.(true);
                    onUpdated?.(10);
                    onOpenChange?.(false);
                }}
            >
                apply-discount
            </button>
        ) : null,
}));

vi.mock("@/components/my-dialog", () => ({
    MyDialog: ({
        children,
        footer,
        open,
        onOpenChange,
    }: {
        children: ReactNode;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        footer?: (props: { close: () => void; loading: boolean }) => React.ReactNode;
    }) =>
        open ? (
            <div>
                <button type="button" onClick={() => onOpenChange?.(false)}>
                    force-close
                </button>
                {children}
                {typeof footer === "function"
                    ? footer({ close: () => onOpenChange?.(false), loading: false })
                    : footer}
            </div>
        ) : null,
}));

vi.mock("@/components/select-dropdown", () => ({
    default: ({
        name,
        api,
        isDisabled,
        placeholder,
    }: {
        name: string;
        api?: string;
        isDisabled?: boolean;
        placeholder?: string;
    }) => {
        if (name === "fund_id") fundApi.value = api;
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

const renderDialog = (
    props?: Partial<{
        invoiceDue: InvoiceDueItem[];
        onOpenChange: (open: boolean) => void;
    }>,
) => {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={client}>
            <BulkInvoicePayDialog
                invoiceDue={props?.invoiceDue ?? invoiceDue}
                open
                onOpenChange={props?.onOpenChange ?? (() => undefined)}
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
        session.canChangeFund = false;
        session.canUseBkash = false;
        session.canDiscount = false;
        discountHarness.enabled = false;
        session.staff = { fund: { id: 4, name: "cash" } };
        fundApi.value = undefined;
    });

    it("asks the API for the funds this user may pay into", async () => {
        renderDialog();
        await waitFor(() => expect(fundSelect()).toBeInTheDocument());
        expect(fundApi.value).toBe("/dropdown-funds?scope=invoice-payment");
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

    it("lets a staff member with invoices.change-fund choose another fund", async () => {
        const user = userEvent.setup();
        session.canChangeFund = true;
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

    it("lets a staff member with invoices.change-fund pay when no fund is assigned", async () => {
        const user = userEvent.setup();
        session.canChangeFund = true;
        session.staff = { fund: null };
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

    it("locks an Admin or Super Admin role without the permission to its own fund", async () => {
        for (const role of ["Admin", "Super Admin"]) {
            session.roles = [role];
            const { unmount } = renderDialog();

            await waitFor(() => expect(fundSelect()).toHaveValue("4"));
            expect(fundSelect()).toBeDisabled();
            unmount();
        }
    });

    it("lets invoices.bkash-fund-access start on the own fund and switch to another allowed fund", async () => {
        const user = userEvent.setup();
        session.canUseBkash = true;
        renderDialog();

        await waitFor(() => expect(fundSelect()).toHaveValue("4"));
        expect(fundSelect()).toBeEnabled();

        await user.selectOptions(fundSelect(), "9");
        await user.click(submitButton());

        await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
        expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ fund_id: 9 }));
    });

    it("lets invoices.bkash-fund-access pay without an own fund (the bKash fund is allowed)", () => {
        session.canUseBkash = true;
        session.staff = { fund: null };
        renderDialog();

        expect(fundSelect()).toBeEnabled();
        expect(fundSelect()).toHaveValue("");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(submitButton()).toBeEnabled();
    });

    it("does not select a fund or show the unassigned warning while user data is missing", () => {
        session.staff = {};
        renderDialog();

        expect(fundSelect()).toBeDisabled();
        expect(fundSelect()).toHaveValue("");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(submitButton()).toBeDisabled();
        expect(mutate).not.toHaveBeenCalled();
    });
});

describe("BulkInvoicePayDialog discount", () => {
    beforeEach(() => {
        mutate.mockReset();
        session.roles = ["Staff"];
        session.canChangeFund = false;
        session.canDiscount = true;
        discountHarness.enabled = true;
        session.staff = { fund: { id: 4, name: "cash" } };
    });

    it("keeps the pay dialog open and recalculates the discount and due", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        renderDialog({
            onOpenChange,
            invoiceDue: [
                {
                    uuid: "inv-1",
                    trackID: "INV-1",
                    total_amount: 100,
                    after_discount_amount: 80,
                    discount: 0,
                    line_total_discount: 20,
                    amount_paid: 0,
                },
            ] as InvoiceDueItem[],
        });

        expect(screen.getByText(/invoice\.bulk_pay\.row\.discount/)).toHaveTextContent("৳20");
        expect(screen.getAllByText("৳80").length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: "apply-discount" }));

        expect(screen.getByText(/invoice\.bulk_pay\.row\.discount/)).toHaveTextContent("৳30");
        expect(screen.getAllByText("৳70").length).toBeGreaterThan(0);
        expect(screen.queryByText("৳80")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "invoice.bulk_pay.submit" })).toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "force-close" }));
        expect(onOpenChange).not.toHaveBeenCalled();

        await new Promise((resolve) => setTimeout(resolve, 350));
        await user.click(screen.getByRole("button", { name: "force-close" }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});

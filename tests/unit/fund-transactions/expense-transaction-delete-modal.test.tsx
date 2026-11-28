import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExpenseTransactionDeleteModal } from "@/components/fund-transactions/expense-transaction-delete-modal";

const permissions = vi.hoisted(() => ({ names: [] as string[] }));
const mutateAsync = vi.fn(async (_payload: unknown) => undefined);
const useApiMutationMock = vi.fn((_options: unknown) => ({ mutateAsync, isPending: false }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => permissions.names.includes(name),
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: (options: unknown) => useApiMutationMock(options),
}));

vi.mock("@/components/ui/dialog", () => ({
    DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

// The dialog body and footer, always open: only the choice and the request are under test.
vi.mock("@/components/my-dialog", () => ({
    MyDialog: ({
        children,
        footer,
    }: {
        children: ReactNode;
        footer: (state: { close: () => void; loading: boolean }) => ReactNode;
    }) => (
        <div>
            {children}
            {footer({ close: () => undefined, loading: false })}
        </div>
    ),
}));

vi.mock("@/components/my-button", () => ({
    default: ({ title, onClick }: { title?: string; onClick?: () => void }) => (
        <button type="button" onClick={onClick}>
            {title}
        </button>
    ),
}));

const PENDING = "fund_transaction.expense_delete.pending.label";
const DELETE = "fund_transaction.expense_delete.delete.label";

const renderModal = () => render(<ExpenseTransactionDeleteModal api_url="/fund-transactions/7" />);

describe("expense fund transaction delete dialog", () => {
    beforeEach(() => {
        permissions.names = ["expenses.delete"];
        mutateAsync.mockClear();
        useApiMutationMock.mockClear();
    });

    // ডায়ালগ খুললে "পেন্ডিং করুন" অপশন আগে থেকেই বাছাই করা থাকে এবং Delete চাপলে সেটিই API-তে যায় কি না যাচাই করি।
    it("Expense transaction delete: 'change status to pending' is selected by default and sent on delete", async () => {
        renderModal();

        expect(screen.getByLabelText(PENDING)).toBeChecked();
        expect(screen.getByLabelText(DELETE)).not.toBeChecked();

        fireEvent.click(screen.getByRole("button", { name: "common.delete" }));

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ expense_action: "pending" }));
        expect(useApiMutationMock).toHaveBeenCalledWith(
            expect.objectContaining({
                url: "/fund-transactions/7",
                method: "DELETE",
                invalidateKeys: "fund-transactions,funds,expenses",
            }),
        );
    });

    // "এই এক্সপেন্সটি মুছে ফেলুন" বাছাই করে Delete চাপলে API-তে delete অ্যাকশন যায় কি না যাচাই করি।
    it("Expense transaction delete: choosing 'delete this expense' sends the delete action", async () => {
        renderModal();

        fireEvent.click(screen.getByLabelText(DELETE));
        expect(screen.getByLabelText(DELETE)).toBeChecked();

        fireEvent.click(screen.getByRole("button", { name: "common.delete" }));

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ expense_action: "delete" }));
    });

    // expenses.delete অনুমতি না থাকলে "মুছে ফেলুন" অপশন বন্ধ থাকে এবং কারণ দেখানো হয় কি না যাচাই করি।
    it("Expense transaction delete: 'delete this expense' is disabled without the expenses.delete permission", () => {
        permissions.names = [];
        renderModal();

        expect(screen.getByLabelText(DELETE)).toBeDisabled();
        expect(screen.getByText("fund_transaction.expense_delete.delete.no_permission")).toBeInTheDocument();
        expect(screen.getByLabelText(PENDING)).toBeChecked();
    });
});

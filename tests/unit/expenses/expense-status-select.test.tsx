import { fireEvent, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExpenseColumns } from "@/components/expenses/expense-column";
import { ExpenseRow } from "@/components/expenses/expense-type";

const permissions = vi.hoisted(() => ({
    names: ["expenses.approval"],
}));
const mutate = vi.fn();
const useApiMutationMock = vi.fn((_options: unknown) => ({ mutate, isPending: false }));

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

vi.mock("@/components/expenses/expense-form", () => ({
    default: () => null,
}));

vi.mock("@/components/delete-modal", () => ({
    DeleteModal: () => null,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: ReactNode }) => <div role="menu">{children}</div>,
    DropdownMenuItem: ({
        children,
        onSelect,
        "aria-checked": checked,
    }: {
        children: ReactNode;
        onSelect?: () => void;
        "aria-checked"?: boolean;
    }) => (
        <button type="button" role="menuitem" aria-checked={checked} onClick={() => onSelect?.()}>
            {children}
        </button>
    ),
}));

const expense = {
    id: "expense-uuid",
    amount: 250,
    status: "pending",
} as unknown as ExpenseRow;

const renderCell = (accessorKey: string) => {
    const column = ExpenseColumns.find((item) => {
        if ("accessorKey" in item && item.accessorKey === accessorKey) return true;
        return "id" in item && item.id === accessorKey;
    });
    const cell = column?.cell;
    if (typeof cell !== "function") throw new Error(`${accessorKey} cell missing`);

    return render(cell({ row: { original: expense } } as never) as ReactElement);
};

describe("expense status column", () => {
    beforeEach(() => {
        permissions.names = ["expenses.approval"];
        mutate.mockClear();
        useApiMutationMock.mockClear();
    });

    it("shows the current status and lists pending, approved, and declined", () => {
        const view = renderCell("status");
        const button = view.getByRole("button", { name: "expense.status.change: common.pending" });

        expect(button).toHaveTextContent("common.pending");
        expect(view.getByRole("menuitem", { name: "common.pending" })).toHaveAttribute("aria-checked", "true");
        expect(view.getByRole("menuitem", { name: "common.approved" })).toHaveAttribute("aria-checked", "false");
        expect(view.getByRole("menuitem", { name: "expense.declined" })).toHaveAttribute("aria-checked", "false");
    });

    it("saves the status chosen from the menu", () => {
        const view = renderCell("status");

        fireEvent.click(view.getByRole("menuitem", { name: "common.approved" }));

        expect(useApiMutationMock).toHaveBeenCalledWith(expect.objectContaining({
            url: "/expense-status/expense-uuid",
            method: "PUT",
            invalidateKeys: "expenses",
            successMessage: "expense.status_updated",
        }));
        expect(mutate).toHaveBeenCalledWith({ status: "approved" });
        expect(view.getByRole("button", { name: "expense.status.change: common.approved" })).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "common.approved" })).toHaveAttribute("aria-checked", "true");
    });

    it("keeps a badge when the user cannot change status", () => {
        permissions.names = [];

        const view = renderCell("status");

        expect(view.queryByRole("button")).not.toBeInTheDocument();
        expect(view.getByText("common.pending")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });

    it("keeps edit and delete in actions without approve or decline buttons", () => {
        const view = renderCell("actions");

        expect(view.queryByRole("button", { name: "expense.approve" })).not.toBeInTheDocument();
        expect(view.queryByRole("button", { name: "expense.decline" })).not.toBeInTheDocument();
        expect(view.container.querySelector("svg")).not.toBeInTheDocument();
    });
});

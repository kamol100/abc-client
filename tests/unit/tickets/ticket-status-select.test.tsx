import { fireEvent, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TicketColumns } from "@/components/tickets/ticket-column";
import { TicketRow } from "@/components/tickets/ticket-type";

const permissions = vi.hoisted(() => ({ allowed: true }));
const mutate = vi.fn();
const useApiMutationMock = vi.fn((_options: unknown) => ({ mutate, isPending: false }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => name === "tickets.edit" && permissions.allowed,
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: (options: unknown) => useApiMutationMock(options),
}));

vi.mock("@/components/tickets/ticket-row-actions", () => ({
    default: () => null,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: ReactNode }) => <div role="menu">{children}</div>,
    DropdownMenuItem: ({
        children,
        onSelect,
    }: {
        children: ReactNode;
        onSelect?: () => void;
    }) => (
        <button type="button" role="menuitem" onClick={() => onSelect?.()}>
            {children}
        </button>
    ),
}));

const ticket = {
    id: "ticket-uuid",
    ticket_code: "TKT-1042",
    message: "Fiber outage",
    priority: "medium",
    status: "in_progress",
} as unknown as TicketRow;

const renderStatusCell = () => {
    const column = TicketColumns.find((item) => "accessorKey" in item && item.accessorKey === "status");
    const cell = column?.cell;
    if (typeof cell !== "function") throw new Error("status cell missing");

    return render(cell({ row: { original: ticket } } as never) as ReactElement);
};

describe("ticket status column", () => {
    beforeEach(() => {
        permissions.allowed = true;
        mutate.mockClear();
        useApiMutationMock.mockClear();
    });

    it("shows the current status on a button and lists every status", () => {
        const view = renderStatusCell();
        const button = view.getByRole("button", { name: "ticket.status.change: ticket.status.in_progress" });

        expect(button).toHaveTextContent("ticket.status.in_progress");
        expect(button.querySelector("svg")).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "ticket.status.open" })).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "ticket.status.in_progress" })).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "ticket.status.resolved" })).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "ticket.status.closed" })).toBeInTheDocument();
    });

    it("saves the status chosen from the menu", () => {
        const view = renderStatusCell();

        fireEvent.click(view.getByRole("menuitem", { name: "ticket.status.resolved" }));

        expect(useApiMutationMock).toHaveBeenCalledWith(expect.objectContaining({
            url: "/tickets/ticket-uuid",
            method: "PUT",
            invalidateKeys: "tickets",
            successMessage: "ticket.status.updated",
        }));
        expect(mutate).toHaveBeenCalledWith({ status: "resolved" });
        expect(view.getByRole("button", { name: "ticket.status.change: ticket.status.resolved" })).toBeInTheDocument();
    });

    it("keeps a badge when the user cannot edit tickets", () => {
        permissions.allowed = false;

        const view = renderStatusCell();

        expect(view.queryByRole("button")).not.toBeInTheDocument();
        expect(view.getByText("ticket.status.in_progress")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });
});

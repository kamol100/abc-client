import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TicketColumns } from "@/components/tickets/ticket-column";
import { TicketRow } from "@/components/tickets/ticket-type";

const permissions = vi.hoisted(() => ({
    names: ["tickets.status.update", "tickets.assignee.update"],
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

vi.mock("@/hooks/use-api-query", () => ({
    default: () => ({
        data: {
            data: [
                { id: 7, name: "Mina" },
                { id: 9, name: "Rafi" },
            ],
        },
    }),
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

const ticket = {
    id: "ticket-uuid",
    ticket_code: "TKT-1042",
    message: "Fiber outage",
    priority: "medium",
    status: "in_progress",
    staff: { id: 4, name: "Nila" },
} as unknown as TicketRow;

const renderCell = (accessorKey: string) => {
    const column = TicketColumns.find((item) => "accessorKey" in item && item.accessorKey === accessorKey);
    const cell = column?.cell;
    if (typeof cell !== "function") throw new Error(`${accessorKey} cell missing`);

    return render(cell({ row: { original: ticket } } as never) as ReactElement);
};

describe("ticket status column", () => {
    beforeEach(() => {
        permissions.names = ["tickets.status.update", "tickets.assignee.update"];
        mutate.mockClear();
        useApiMutationMock.mockClear();
    });

    it("keeps status and assignee columns visible", () => {
        const status = TicketColumns.find((item) => "accessorKey" in item && item.accessorKey === "status");
        const assignee = TicketColumns.find((item) => "accessorKey" in item && item.accessorKey === "staff");

        expect(status?.enableHiding).toBe(false);
        expect(assignee?.enableHiding).toBe(false);
    });

    it("shows the current status on a button and lists every status", () => {
        const view = renderCell("status");
        const button = view.getByRole("button", { name: "ticket.status.change: ticket.status.in_progress" });

        expect(button).toHaveTextContent("ticket.status.in_progress");
        expect(button.querySelector("svg")).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "ticket.status.open" })).toHaveAttribute("aria-checked", "false");
        expect(view.getByRole("menuitem", { name: "ticket.status.in_progress" })).toHaveAttribute("aria-checked", "true");
        expect(view.getByRole("menuitem", { name: "ticket.status.resolved" })).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "ticket.status.closed" })).toBeInTheDocument();
    });

    it("saves the status chosen from the menu", () => {
        const view = renderCell("status");

        fireEvent.click(view.getByRole("menuitem", { name: "ticket.status.resolved" }));

        expect(useApiMutationMock).toHaveBeenCalledWith(expect.objectContaining({
            url: "/ticket-status/ticket-uuid",
            method: "PUT",
            invalidateKeys: "tickets",
            successMessage: "ticket.status.updated",
        }));
        expect(mutate).toHaveBeenCalledWith({ status: "resolved" });
        expect(view.getByRole("button", { name: "ticket.status.change: ticket.status.resolved" })).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "ticket.status.resolved" })).toHaveAttribute("aria-checked", "true");
        expect(view.getByRole("menuitem", { name: "ticket.status.in_progress" })).toHaveAttribute("aria-checked", "false");
    });

    it("keeps a badge when the user cannot change status", () => {
        permissions.names = [];

        const view = renderCell("status");

        expect(view.queryByRole("button")).not.toBeInTheDocument();
        expect(view.getByText("ticket.status.in_progress")).toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });
});

describe("ticket assignee column", () => {
    beforeEach(() => {
        permissions.names = ["tickets.status.update", "tickets.assignee.update"];
        mutate.mockClear();
        useApiMutationMock.mockClear();
    });

    it("shows a user icon and lists the current staff, other staff, and clear", () => {
        const view = renderCell("staff");
        const button = view.getByRole("button", { name: "ticket.assigned_to.change: Nila" });

        expect(button).toHaveTextContent("Nila");
        expect(button.querySelector("svg")).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "Nila" })).toHaveAttribute("aria-checked", "true");
        expect(view.getByRole("menuitem", { name: "Mina" })).toHaveAttribute("aria-checked", "false");
        expect(view.getByRole("menuitem", { name: "Mina" })).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "Rafi" })).toBeInTheDocument();
        expect(view.getByRole("menuitem", { name: "ticket.not_assigned" })).toBeInTheDocument();
    });

    it("saves the staff chosen from the menu and can clear the assignee", () => {
        const view = renderCell("staff");

        expect(useApiMutationMock).toHaveBeenCalledWith(expect.objectContaining({
            url: "/ticket-assignee/ticket-uuid",
            method: "PUT",
            invalidateKeys: "tickets",
            successMessage: "ticket.assigned_to.updated",
        }));

        fireEvent.click(view.getByRole("menuitem", { name: "Rafi" }));

        expect(mutate).toHaveBeenCalledWith({ assigned_to: 9 });
        expect(view.getByRole("button", { name: "ticket.assigned_to.change: Rafi" })).toBeInTheDocument();

        fireEvent.click(view.getByRole("menuitem", { name: "ticket.not_assigned" }));

        expect(mutate).toHaveBeenCalledWith({ assigned_to: null });
        expect(view.getByRole("button", { name: "ticket.assigned_to.change: ticket.not_assigned" })).toBeInTheDocument();
    });

    it("shows the user icon and name without a menu when the user cannot assign", () => {
        permissions.names = [];

        const view = renderCell("staff");

        expect(view.container.querySelector("svg")).toBeInTheDocument();
        expect(view.getByText("Nila")).toBeInTheDocument();
        expect(view.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
        expect(mutate).not.toHaveBeenCalled();
    });
});

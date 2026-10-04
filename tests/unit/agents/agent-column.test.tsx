import { render, renderHook } from "@testing-library/react";
import type { ReactElement } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { useAgentColumns } from "@/components/agents/agent-column";
import { AgentRow } from "@/components/agents/agent-type";

const { allowed } = vi.hoisted(() => ({
    allowed: new Set<string>(["agents.edit", "agents.delete"]),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => allowed.has(name),
    }),
}));

vi.mock("@/components/agents/agent-form", () => ({
    default: () => null,
}));

vi.mock("@/components/agent-transactions/agent-transaction-form", () => ({
    default: () => null,
}));

vi.mock("@/components/agent-transactions/agent-transaction-table", () => ({
    default: () => null,
}));

vi.mock("@/components/delete-modal", () => ({
    DeleteModal: () => null,
}));

const columnIds = (columns: ColumnDef<AgentRow>[]) =>
    columns.map((column) =>
        "accessorKey" in column && column.accessorKey
            ? String(column.accessorKey)
            : column.id
    );

describe("useAgentColumns", () => {
    it("shows the agent fields and row actions", () => {
        allowed.clear();
        allowed.add("agents.edit");
        allowed.add("agents.delete");

        const { result } = renderHook(() => useAgentColumns());

        expect(columnIds(result.current)).toEqual([
            "name",
            "phone",
            "commission",
            "balance",
            "status",
            "note",
            "actions",
        ]);
    });

    it("hides edit and delete when the user lacks those permissions", () => {
        allowed.clear();

        const { result } = renderHook(() => useAgentColumns());
        const actions = result.current.find((column) => column.id === "actions");
        const cell = actions?.cell;

        expect(typeof cell).toBe("function");
        if (typeof cell !== "function") return;

        const rendered = cell({
            row: { original: { id: "agent-uuid", status: "active" } },
        } as never);

        const view = render(rendered as ReactElement);
        expect(view.container).toBeEmptyDOMElement();
    });
});

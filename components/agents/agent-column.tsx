"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import MyBadge from "@/components/my-badge";
import AgentForm from "@/components/agents/agent-form";
import { AgentRow } from "@/components/agents/agent-type";
import { usePermissions } from "@/context/app-provider";

function AgentStatusCell({ status }: { status: AgentRow["status"] }) {
    const { t } = useTranslation();
    const isActive = status === "active";

    return (
        <MyBadge type={isActive ? "success" : "decline"} className="capitalize">
            {isActive ? t("agent.status.active") : t("agent.status.inactive")}
        </MyBadge>
    );
}

export function useAgentColumns(): ColumnDef<AgentRow>[] {
    const { hasPermission } = usePermissions();

    return [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="agent.name.label" />
            ),
            cell: ({ row }) => <div className="capitalize">{row.original.name}</div>,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "phone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="agent.phone.label" />
            ),
            cell: ({ row }) => <div>{row.original.phone || "-"}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "commission",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="agent.commission.label" />
            ),
            cell: ({ row }) => <div>{row.original.commission}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="agent.status.label" />
            ),
            cell: ({ row }) => <AgentStatusCell status={row.original.status} />,
            enableSorting: false,
        },
        {
            accessorKey: "note",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="agent.note.label" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.original.note ?? undefined}>
                    {row.original.note || "-"}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    className="flex justify-end capitalize mr-3"
                    title="common.actions"
                />
            ),
            cell: ({ row }) => {
                const agent = row.original;
                const canEdit = hasPermission("agents.edit");
                const canDelete = hasPermission("agents.delete");

                if (!canEdit && !canDelete) return null;

                return (
                    <div className="flex items-end justify-end gap-2 mr-3">
                        {canEdit && (
                            <AgentForm
                                mode="edit"
                                data={{ id: agent.id }}
                                api="/agents"
                                method="PUT"
                            />
                        )}
                        {canDelete && (
                            <DeleteModal
                                api_url={`/agents/${agent.id}`}
                                keys="agents"
                                confirmMessage="agent.delete_confirmation"
                                buttonText="common.confirm_delete"
                            />
                        )}
                    </div>
                );
            },
        },
    ];
}

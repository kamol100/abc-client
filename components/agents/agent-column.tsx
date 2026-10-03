"use client";

import { FC, useState } from "react";
import { Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import DisplayCount from "@/components/display-count";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import AgentForm from "@/components/agents/agent-form";
import AgentTransactionTable from "@/components/agent-transactions/agent-transaction-table";
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

const AgentActionsCell: FC<{ agent: AgentRow }> = ({ agent }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [openTransactions, setOpenTransactions] = useState(false);

    const canEdit = hasPermission("agents.edit");
    const canDelete = hasPermission("agents.delete");
    const canViewTransactions = hasPermission("agent-transactions.show");

    if (!canEdit && !canDelete && !canViewTransactions) {
        return null;
    }

    return (
        <div className="flex items-center justify-end gap-2 mr-3">
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
            {canViewTransactions && (
                <>
                    <MyButton
                        type="button"
                        variant="outline"
                        onClick={() => setOpenTransactions(true)}
                        tooltip={t("common.view")}
                    >
                        <Eye />
                    </MyButton>

                    {openTransactions && (
                        <MyDialog
                            open={openTransactions}
                            onOpenChange={setOpenTransactions}
                            size="4xl"
                            title="agent_transaction.title_plural"
                        >
                            <AgentTransactionTable
                                apiUrl={`agent-transactions/${agent.id}`}
                                queryKey={`agent-transactions-${agent.id}`}
                            />
                        </MyDialog>
                    )}
                </>
            )}
        </div>
    );
};

export function useAgentColumns(): ColumnDef<AgentRow>[] {
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
            accessorKey: "balance",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="agent.balance.label" />
            ),
            cell: ({ row }) => <DisplayCount amount={row.original.balance} formatCurrency />,
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
            cell: ({ row }) => <AgentActionsCell agent={row.original} />,
        },
    ];
}

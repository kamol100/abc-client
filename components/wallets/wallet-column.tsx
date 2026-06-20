"use client";

import { FC, useState } from "react";
import { Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import { toNumber } from "@/lib/helper/helper";
import MyButton from "@/components/my-button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DisplayCount from "@/components/display-count";
import { TransactionModal } from "@/components/wallets/transaction-modal";
import { ClientWalletRow } from "@/components/wallets/wallet-type";

const ClientWalletActionsCell: FC<{ wallet: ClientWalletRow }> = ({ wallet }) => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [openTransactions, setOpenTransactions] = useState(false);

  const canViewTransactions = hasPermission("wallets.access");
  const walletId = wallet.id;

  if (!canViewTransactions || !walletId) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-2">
      <MyButton
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpenTransactions(true)}
        title={t("common.view")}
      >
        <Eye className="h-4 w-4" />
      </MyButton>

      {openTransactions && (
        <TransactionModal
          walletId={walletId}
          open={openTransactions}
          onOpenChange={setOpenTransactions}
        />
      )}
    </div>
  );
};

export const ClientWalletColumns: ColumnDef<ClientWalletRow>[] = [
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.client.label" />
    ),
    cell: ({ row }) => <span className="capitalize">{row.original.client?.name ?? "—"}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.balance.label" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-primary">
        <DisplayCount amount={toNumber(row.original.balance)} formatCurrency />
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.created_at.label" />
    ),
    cell: ({ row }) => <span>{row.original.created_at ?? "—"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "note",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.note.label" />
    ),
    cell: ({ row }) => <p className="line-clamp-1">{row.original.note ?? "—"}</p>,
    enableSorting: false,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="common.actions"
        className="flex justify-end mr-2"
      />
    ),
    cell: ({ row }) => <ClientWalletActionsCell wallet={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];

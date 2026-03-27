"use client";

import { FC, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import { cellIndex, formatMoney, toNumber } from "@/lib/helper/helper";
import MyButton from "@/components/my-button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import { MyDialog } from "@/components/my-dialog";
import { Badge } from "@/components/ui/badge";
import FundTransactionForm from "@/components/fund-transactions/fund-transaction-form";
import FundTransactionTable from "@/components/fund-transactions/fund-transaction-table";
import FundForm from "./fund-form";
import { FundRow } from "./fund-type";
import DisplayCount from "../display-count";
import MyBadge from "../my-badge";

type GetPagination = () => Pagination | undefined;

const FundActionsCell: FC<{ fund: FundRow }> = ({ fund }) => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [openTransactionForm, setOpenTransactionForm] = useState(false);
  const [openTransactions, setOpenTransactions] = useState(false);

  const canEdit = hasPermission("funds.edit");
  const canCreateTransaction = hasPermission("fund-transactions.create");
  const canViewTransactions = hasPermission("fund-transactions.show");
  const canDelete = hasPermission("funds.delete");

  return (
    <div className="flex items-center justify-end gap-2 mr-2">
      {canEdit && (
        <FundForm
          mode="edit"
          data={{ id: fund.id }}
          api="/funds"
          method="PUT"
        />
      )}

      {canCreateTransaction && (
        <>
          <MyButton
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setOpenTransactionForm(true)}
            title={t("fund_transaction.create_title")}
          >
            <Plus className="h-4 w-4 " />
          </MyButton>
          <FundTransactionForm
            fundId={fund.id}
            fundName={fund.name}
            fundBalance={fund.balance}
            open={openTransactionForm}
            onOpenChange={setOpenTransactionForm}
          />
        </>
      )}

      {canViewTransactions && (
        <>
          <MyButton
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setOpenTransactions(true)}
            title={t("common.view")}
          >
            <Eye className="h-4 w-4" />
          </MyButton>

          <MyDialog
            open={openTransactions}
            onOpenChange={setOpenTransactions}
            size="4xl"
            title="fund_transaction.title_plural"
          >
            <FundTransactionTable
              apiUrl={`fund-transactions/${fund.id}`}
              queryKey={`fund-transactions-${fund.id}`}
              includeFundFilter={false}
              showFundColumn={false}
              hideCreateAction
            />
          </MyDialog>
        </>
      )}

      {canDelete && fund.deletable > 0 && (
        <DeleteModal
          api_url={`/funds/${fund.id}`}
          keys="funds"
          confirmMessage="fund.delete_confirmation"
        />
      )}
    </div>
  );
};

export const getFundColumns = (
  getPagination: GetPagination
): ColumnDef<FundRow>[] => [
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund.sl" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{cellIndex(row.index, getPagination())}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "short_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund.short_name.label" />
      ),
      cell: ({ row }) => <span>{row.original.short_name ?? "—"}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund.name.label" />
      ),
      cell: ({ row }) => <span className="capitalize">{row.original.name}</span>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "staff.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund.staff.label" />
      ),
      cell: ({ row }) => <span>{row.original.staff?.name ?? "—"}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "account_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund.account_number.label" />
      ),
      cell: ({ row }) => <span>{row.original.account_number ?? "—"}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund.balance.label" />
      ),
      cell: ({ row }) => (
        <MyBadge icon={false} variant="outline" color="green">
          <DisplayCount amount={toNumber(row.original.balance)} formatCurrency />
        </MyBadge>
      ),
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
      cell: ({ row }) => <FundActionsCell fund={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];

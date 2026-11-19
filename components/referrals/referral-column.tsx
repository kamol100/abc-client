"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import CompanyForm from "@/components/companies/company-form";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyButton from "@/components/my-button";
import { ReferralDetail, ReferralSellerDetail, ReferralTermValue } from "@/components/referrals/referral-detail";
import { ReferralDecisionForm } from "@/components/referrals/referral-form";
import { ReferralContractForm, ReferralDeactivateForm } from "@/components/referrals/referral-seller-form";
import { referralMoney } from "@/components/referrals/referral-amount";
import type { ReferralActions, ReferralRow, ReferralSeller } from "@/components/referrals/referral-type";
import { usePermissions } from "@/context/app-provider";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-muted text-muted-foreground",
  payable: "bg-primary/10 text-primary",
  paid: "border-primary/25 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

function ReferralStatus({ status }: { status: ReferralRow["status"] }) {
  const { t } = useTranslation();
  return <span className={cn("inline-flex whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 text-xs font-medium", statusStyles[status])}>
    {t(`referral.status.${status}`)}
  </span>;
}

function CommissionCell({ row }: { row: ReferralRow }) {
  const { t, i18n } = useTranslation();
  const amount = row.status === "pending" ? row.pending_amount_minor : row.commission_amount_minor;
  const fallback = row.status === "pending" ? "referral.tbd" : "referral.unavailable";
  return (
    <div className="whitespace-nowrap tabular-nums">
      <div className="font-medium">{amount === null ? t(fallback) : referralMoney(amount, i18n.language)}</div>
      {row.is_estimate && <small className="text-muted-foreground">{t("referral.estimated")}</small>}
    </div>
  );
}

function ReferralRowActions({ row, endpoint, actions }: { row: ReferralRow; endpoint: string; actions?: ReferralActions }) {
  const { hasPermission } = usePermissions();
  const pending = row.status === "pending";
  const provisioning = pending && !row.tenant_linked && row.demo_request_id == null && actions?.can_attribute
    && hasPermission("platform-referrals.attribute") && hasPermission("companies.create");
  return (
    <div className="flex min-w-24 flex-wrap justify-end gap-1.5">
      {hasPermission(`${endpoint}.show`) && <ReferralDetail row={row} endpoint={endpoint} />}
      {provisioning && <CompanyForm
        referral={{ uuid: row.uuid, prospectName: row.prospect_name }}
        trigger={<MyButton size="sm" variant="default" icon={false} title="referral.actions.create_company" />}
      />}
      {pending && row.tenant_available && actions?.can_approve && hasPermission("platform-referrals.approve") && <ReferralDecisionForm row={row} operation="approve" />}
      {pending && actions?.can_reject && hasPermission("platform-referrals.reject") && <ReferralDecisionForm row={row} operation="reject" />}
      {row.status === "payable" && actions?.can_record_payout && hasPermission("platform-referrals.payout") && <ReferralDecisionForm row={row} operation="payout" />}
    </div>
  );
}

function ReferralSellerName({ row }: { row: ReferralRow }) {
  const { t } = useTranslation();
  return row.seller && <div className="min-w-28">
    <div className="font-medium">{row.seller.display_name}</div>
    <small className="text-muted-foreground">{t(`referral.seller_type.${row.seller.seller_type}`)}</small>
  </div>;
}

export function referralColumns(endpoint: string, actions?: ReferralActions): ColumnDef<ReferralRow>[] {
  const sellerColumn: ColumnDef<ReferralRow> = {
    id: "seller",
    meta: { className: "hidden md:table-cell" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="referral.seller" />,
    cell: ({ row }) => <ReferralSellerName row={row.original} />,
    enableSorting: false,
  };
  return [
    {
      accessorKey: "prospect_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="referral.fields.prospect_name" />,
      cell: ({ row }) => <span className="block min-w-24 break-words font-medium">{row.original.prospect_name}</span>,
      enableSorting: false,
    },
    ...(endpoint === "platform-referrals" ? [sellerColumn] : []),
    {
      id: "terms",
      meta: { className: "hidden sm:table-cell" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="referral.fields.commission_type" />,
      cell: ({ row }) => <ReferralTermValue terms={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="referral.fields.status" />,
      cell: ({ row }) => <ReferralStatus status={row.original.status} />,
      enableSorting: false,
    },
    {
      id: "commission",
      header: ({ column }) => <DataTableColumnHeader column={column} title="referral.commission" />,
      cell: ({ row }) => <CommissionCell row={row.original} />,
      enableSorting: false,
    },
    {
      id: "actions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="common.actions" className="justify-end" />,
      cell: ({ row }) => <ReferralRowActions row={row.original} endpoint={endpoint} actions={actions} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

function SellerType({ seller }: { seller: ReferralSeller }) {
  const { t } = useTranslation();
  return <>{t(`referral.seller_type.${seller.seller_type}`)}</>;
}

function SellerStatus({ seller }: { seller: ReferralSeller }) {
  const { t } = useTranslation();
  return <>{t(`common.${seller.status}`)}</>;
}

function SellerActions({ seller }: { seller: ReferralSeller }) {
  const { hasPermission } = usePermissions();
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {hasPermission("platform-referral-sellers.show") && <ReferralSellerDetail seller={seller} />}
      {hasPermission("platform-referral-sellers.contracts.create") && <ReferralContractForm seller={seller} />}
      {seller.status === "active" && hasPermission("platform-referral-sellers.deactivate") && <ReferralDeactivateForm seller={seller} />}
    </div>
  );
}

export const referralSellerColumns: ColumnDef<ReferralSeller>[] = [
  {
    accessorKey: "display_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="referral.seller" />,
    enableSorting: false,
  },
  {
    accessorKey: "seller_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="referral.fields.seller_type" />,
    cell: ({ row }) => <SellerType seller={row.original} />,
    enableSorting: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="referral.fields.code" />,
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="referral.fields.status" />,
    cell: ({ row }) => <SellerStatus seller={row.original} />,
    enableSorting: false,
  },
  {
    id: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="common.actions" className="justify-end" />,
    cell: ({ row }) => <SellerActions seller={row.original} />,
    enableHiding: false,
    enableSorting: false,
  },
];

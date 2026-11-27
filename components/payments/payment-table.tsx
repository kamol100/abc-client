"use client";

import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { toNumber } from "@/lib/helper/helper";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Banknote, Wallet } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import SummaryChip from "@/components/summary-chip";
import { usePermissions, useProfile } from "@/context/app-provider";
import { PaymentColumns } from "@/components/payments/payment-column";
import { PaymentRow } from "@/components/payments/payment-type";
import PaymentFilterSchema, { paymentListParams } from "@/components/payments/payment-filter-schema";

type PaymentListPayload = {
    data: PaymentRow[];
    pagination: Pagination;
    // amount: money collected. wallet_paid_amount: bills settled from client wallets
    // (that money was collected earlier, as an advance payment).
    reports?: { amount?: number | string; wallet_paid_amount?: number | string } | null;
};
type PaymentApiResponse = ApiResponse<PaymentListPayload>;

type PaymentTableProps = {
    toolbarTitleKey?: string;
    filterValue?: string;
    tableToolBar?: boolean
};

const PaymentTable: FC<PaymentTableProps> = ({
    toolbarTitleKey = "payment.title_plural",
    filterValue,
    tableToolBar = true
}) => {
    const [filter, setFilter] = useState<string | null>(filterValue ?? null);
    const { hasPermission } = usePermissions();
    const { profile } = useProfile();
    const canViewAllPayments = hasPermission("payments.view.all");
    const params = useMemo(
        () => paymentListParams(filter, canViewAllPayments, profile.staff?.id),
        [canViewAllPayments, filter, profile.staff?.id],
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaymentApiResponse>({
            queryKey: ["payments"],
            url: "payments",
            params,
        });

    const payments = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const totalPaid = data?.data?.reports?.amount;
    const walletPaid = data?.data?.reports?.wallet_paid_amount;
    const { t } = useTranslation();

    const toolbarTitle = pagination?.total
        ? `${t(toolbarTitleKey)} (${pagination.total})`
        : t(toolbarTitleKey);

    const totalChip = (
        <SummaryChip icon={Banknote} label="payment.total_paid" amount={toNumber(totalPaid)} isLoading={isLoading} />
    );
    // Always rendered, so the toolbar does not move when the totals arrive.
    const walletChip = (
        <SummaryChip icon={Wallet} label="payment.paid_from_wallet" amount={toNumber(walletPaid)} isLoading={isLoading} />
    );

    const toolbar: DataTableToolbarConfig | false = tableToolBar ? {
        title: toolbarTitle,
        center: [
            { key: "total-paid", node: totalChip },
            { key: "wallet-paid", node: walletChip },
        ],
        page: "payments",
        features: {
            columns: true,
            filter: { filter: PaymentFilterSchema(canViewAllPayments) },
        },
    } : false;

    return (
        <div className="space-y-4">
            {/* Without the toolbar (client view), the total sits above the table. */}
            {!tableToolBar && <div className="flex flex-wrap gap-2">{totalChip}{walletChip}</div>}

            <DataTable
                data={payments}
                setFilter={setFilter}
                toolbar={toolbar}
                columns={PaymentColumns}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="payments"
            />
        </div>
    );
};

export default PaymentTable;

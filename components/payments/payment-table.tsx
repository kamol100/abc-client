"use client";

import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { toNumber } from "@/lib/helper/helper";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import { PrefixSettingsButton } from "@/components/settings/settings-section-button";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DisplayCount from "@/components/display-count";
import { usePermissions, useProfile } from "@/context/app-provider";
import { PaymentColumns } from "@/components/payments/payment-column";
import { PaymentRow } from "@/components/payments/payment-type";
import PaymentFilterSchema, { paymentListParams } from "@/components/payments/payment-filter-schema";

type PaymentListPayload = {
    data: PaymentRow[];
    pagination: Pagination;
    reports?: { amount?: number | string } | null;
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
    const { t } = useTranslation();

    const toolbarTitle = pagination?.total
        ? `${t(toolbarTitleKey)} (${pagination.total})`
        : t(toolbarTitleKey);

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{t("payment.total_paid")}</p>
                    {isLoading ? (
                        <Skeleton className="h-8 w-32 mt-2" />
                    ) : (
                        <DisplayCount
                            amount={toNumber(totalPaid)}
                            formatCurrency
                            className="text-xl font-semibold text-primary"
                            animate
                            duration={800}
                        />
                    )}
                </CardContent>
            </Card>

            <DataTable
                data={payments}
                setFilter={setFilter}
                toolbar={tableToolBar}
                columns={PaymentColumns}
                toggleColumns
                toolbarBeforeViewOptions={<PrefixSettingsButton field="pid_prefix" />}
                toolbarOptions={{ filter: PaymentFilterSchema(canViewAllPayments) }}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="payments"
                toolbarTitle={toolbarTitle}
            />
        </div>
    );
};

export default PaymentTable;

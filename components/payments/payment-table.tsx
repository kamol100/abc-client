"use client";

import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { formatMoney } from "@/lib/helper/helper";
import { Plus } from "lucide-react";
import Link from "next/link";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { useSidebar } from "@/components/ui/sidebar";
import ActionButton from "../action-button";
import { PaymentColumns } from "./payment-column";
import { PaymentRow } from "./payment-type";

type PaymentApiResponse = PaginatedApiResponse<PaymentRow> & {
    data?: {
        reports?: { amount?: number | string };
    };
};

const PaymentTable: FC = () => {
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue],
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
    const { isMobile } = useSidebar();

    const toolbarTitle = pagination?.total
        ? `${t("payment.title_plural")} (${pagination.total})`
        : t("payment.title_plural");

    const FormLink = () => (
        <div className="flex items-center gap-3">
            {totalPaid !== undefined && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                    {t("payment.total_paid")}: <strong className="text-primary">৳{formatMoney(totalPaid)}</strong>
                </span>
            )}
            <Link href="/payments/create">
                <ActionButton size="default" variant="default">
                    {isMobile ? <Plus /> : <><Plus /> {t("common.add")}</>}
                </ActionButton>
            </Link>
        </div>
    );

    return (
        <DataTable
            data={payments}
            setFilter={setFilter}
            columns={PaymentColumns}
            toggleColumns
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="payments"
            form={FormLink}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default PaymentTable;

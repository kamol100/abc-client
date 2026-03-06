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
    //const totalPaid = data?.data?.reports?.amount;
    const { t } = useTranslation();

    const toolbarTitle = pagination?.total
        ? `${t("payment.title_plural")} (${pagination.total})`
        : t("payment.title_plural");

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
            toolbarTitle={toolbarTitle}
        />
    );
};

export default PaymentTable;

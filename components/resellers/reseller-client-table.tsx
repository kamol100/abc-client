"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { useResellerClientColumns } from "@/components/resellers/reseller-client-column";
import { ResellerClientRow } from "@/components/resellers/reseller-type";

type Props = {
    resellerId: string;
};

const ResellerClientTable: FC<Props> = ({ resellerId }) => {
    const { t } = useTranslation();
    const columns = useResellerClientColumns();

    const {
        data,
        isLoading,
        isFetching,
        isError,
        setCurrentPage,
    } = useApiQuery<PaginatedApiResponse<ResellerClientRow>>({
        queryKey: ["resellers", "clients", resellerId],
        url: `resellers/client/${resellerId}`,
    });

    const clients = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    return (
        <Card>
            <div className="border-b bg-muted/40 px-3 py-2.5">
                <h2 className="text-base font-semibold">{t("reseller.view.client_information")}</h2>
            </div>
            <div className="p-3">
                {isError ? (
                    <div className="text-sm text-destructive py-6 text-center">
                        {t("common.request_failed")}
                    </div>
                ) : (
                    <DataTable
                        toolbar={false}
                        data={clients}
                        columns={columns}
                        pagination={pagination}
                        setCurrentPage={setCurrentPage}
                        isLoading={isLoading || isFetching}
                        isFetching={isFetching}
                        queryKey="reseller-client"
                    />
                )}
            </div>
        </Card>
    );
};

export default ResellerClientTable;

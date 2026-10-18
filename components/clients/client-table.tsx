"use client";

import { FC, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { useSidebar } from "@/components/ui/sidebar";
import MyButton from "@/components/my-button";
import { useClientColumns } from "@/components/clients/client-column";
import ClientFilterSchema from "@/components/clients/client-filter-schema";
import { ClientRow } from "@/components/clients/client-type";
import dynamic from "next/dynamic";

const ClientCount = dynamic(() => import("@/components/clients/client-count"), { ssr: false });

const NEW_CLIENTS_THIS_MONTH = "this_month";

type ClientTableProps = {
    createdAt?: string;
};

const ClientTable: FC<ClientTableProps> = ({ createdAt }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { isMobile } = useSidebar();
    const columns = useClientColumns();
    const showNewClientsThisMonth = createdAt === NEW_CLIENTS_THIS_MONTH;

    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(() => {
        const queryParams: Record<string, string> = filterValue
            ? (Object.fromEntries(new URLSearchParams(filterValue)) as Record<string, string>)
            : {};

        if (showNewClientsThisMonth) {
            queryParams.created_at = NEW_CLIENTS_THIS_MONTH;
        }

        return Object.keys(queryParams).length > 0 ? queryParams : undefined;
    }, [filterValue, showNewClientsThisMonth]);

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ClientRow>>({
            queryKey: ["clients"],
            url: "clients",
            params,
        });

    const clients = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarOptions = {
        filter: ClientFilterSchema(),
    };

    const FormLink = () => (
        <MyButton
            action="add"
            size="default"
            variant="default"
            title={isMobile ? undefined : t("common.add")}
            url="/clients/create"
        />
    );

    const toolbarTitle = pagination?.total
        ? `${t("client.title_plural")} (${pagination.total})`
        : t("client.title_plural");

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            {showNewClientsThisMonth && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                    <span>{t("client.new_this_month.notice")}</span>
                    <MyButton
                        action="reset"
                        variant="outline"
                        size="sm"
                        title="client.new_this_month.show_all"
                        onClick={() => router.replace("/clients")}
                    />
                </div>
            )}
            <DataTable
                toolbarInfoComponent={<ClientCount />}
                data={clients}
                setFilter={setFilter}
                columns={columns}
                toolbarOptions={toolbarOptions}
                toggleColumns={true}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading || isFetching}
                isFetching={isFetching}
                queryKey={"clients"}
                form={FormLink}
                toolbarTitle={toolbarTitle}
            />
        </div>
    );
};

export default ClientTable;

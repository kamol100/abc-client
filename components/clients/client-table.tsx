"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { useSidebar } from "@/components/ui/sidebar";
import MyButton from "@/components/my-button";
import { useClientColumns } from "@/components/clients/client-column";
import ClientFilterSchema from "@/components/clients/client-filter-schema";
import ResellerClientFilterSchema from "@/components/clients/reseller-client-filter-schema";
import { ClientRow, getClientId } from "@/components/clients/client-type";
import { ClientOnlineStatusProvider } from "@/components/clients/client-online-status-cell";
import dynamic from "next/dynamic";

const ClientCount = dynamic(() => import("@/components/clients/client-count"), { ssr: false });

const NEW_CLIENTS_THIS_MONTH = "this_month";

type ClientTableProps = {
    createdAt?: string;
    variant?: "default" | "reseller-clients";
};

function createdAtFromLocation(): string {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("created_at") || "";
}

const ClientTable: FC<ClientTableProps> = ({ createdAt, variant = "default" }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [createdAtFromBrowser, setCreatedAtFromBrowser] = useState<string | null>(null);
    const activeCreatedAt = createdAtFromBrowser === null ? createdAt : createdAtFromBrowser || undefined;
    const filterReady = createdAt !== undefined || createdAtFromBrowser !== null;
    const { isMobile } = useSidebar();
    const columns = useClientColumns();
    const isResellerReport = variant === "reseller-clients";
    const showNewClientsThisMonth = activeCreatedAt === NEW_CLIENTS_THIS_MONTH;

    useEffect(() => {
        const readCreatedAt = () => setCreatedAtFromBrowser(createdAtFromLocation());
        readCreatedAt();
        window.addEventListener("popstate", readCreatedAt);
        return () => window.removeEventListener("popstate", readCreatedAt);
    }, []);

    const allClientsHref = isResellerReport ? "/reports/reseller-clients" : "/clients";
    const titleKey = isResellerReport ? "menu.reports.reseller_clients.title" : "client.title_plural";

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
            queryKey: isResellerReport ? ["reseller-clients"] : ["clients"],
            url: isResellerReport ? "resellers/clients" : "clients",
            params,
            enabled: filterReady,
        });

    const clients = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const onlineStatusIds = useMemo(
        () => clients.map((client) => getClientId(client) ?? "").filter((id) => id.length > 0),
        [clients],
    );

    const toolbarOptions = {
        filter: isResellerReport ? ResellerClientFilterSchema() : ClientFilterSchema(),
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
        ? `${t(titleKey)} (${pagination.total})`
        : t(titleKey);

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
                        onClick={() => {
                            setCreatedAtFromBrowser("");
                            router.replace(allClientsHref);
                        }}
                    />
                </div>
            )}
            <ClientOnlineStatusProvider clientIds={onlineStatusIds}>
                <DataTable
                    toolbarInfoComponent={isResellerReport ? undefined : <ClientCount />}
                    data={clients}
                    setFilter={setFilter}
                    columns={columns}
                    toolbarOptions={toolbarOptions}
                    toggleColumns={true}
                    pagination={pagination}
                    setCurrentPage={setCurrentPage}
                    isLoading={!filterReady || isLoading}
                    isFetching={isFetching}
                    queryKey={isResellerReport ? "reseller-clients" : "clients"}
                    form={isResellerReport ? undefined : FormLink}
                    toolbarTitle={toolbarTitle}
                />
            </ClientOnlineStatusProvider>
        </div>
    );
};

export default ClientTable;

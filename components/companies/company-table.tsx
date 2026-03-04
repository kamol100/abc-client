"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { CompanyRow } from "@/components/companies/company-type";
import { CompaniesColumns } from "@/components/companies/companies-column";
import CompanyForm from "@/components/companies/company-form";
import { useTranslation } from "react-i18next";

const CompanyTable: FC = () => {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<CompanyRow>>({
            queryKey: ["companies"],
            url: "companies",
            params,
        });

    const companies = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? t("company.title_plural") + ` (${pagination.total})`
        : t("company.title_plural");

    return (
        <DataTable
            data={companies}
            setFilter={setFilter}
            columns={CompaniesColumns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={CompanyForm}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default CompanyTable;

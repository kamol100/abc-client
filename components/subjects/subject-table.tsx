"use client";

import { FC } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { SubjectColumns } from "./subject-column";
import SubjectForm from "./subject-form";
import { SubjectRow } from "./subject-type";
import { useTranslation } from "react-i18next";

const SubjectTable: FC = () => {
    const { t } = useTranslation();

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<SubjectRow>>({
            queryKey: ["subjects"],
            url: "subjects",
        });
    const subjects = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("subject.title_plural")} (${pagination.total})`
        : t("subject.title_plural");

    return (
        <DataTable
            data={subjects}
            columns={SubjectColumns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={SubjectForm}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default SubjectTable;

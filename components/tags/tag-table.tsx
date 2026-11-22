"use client";

import { FC } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { TagColumns } from "./tag-column";
import TagForm from "./tag-form";
import { TagRow } from "./tag-type";
import { useTranslation } from "react-i18next";

const TagTable: FC = () => {
    const { t } = useTranslation();

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<TagRow>>({
            queryKey: ["tags"],
            url: "tags",
        });

    const tags = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("tag.title_plural")} (${pagination.total})`
        : t("tag.title_plural");

    const toolbar: DataTableToolbarConfig = {
        title: toolbarTitle,
        features: {
            columns: true,
            add: TagForm,
        },
    };

    return (
        <DataTable
            data={tags}
            columns={TagColumns}
            toolbar={toolbar}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
        />
    );
};

export default TagTable;

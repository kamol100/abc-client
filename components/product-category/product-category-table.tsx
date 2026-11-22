"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { ProductCategoryColumns } from "./product-category-column";
import ProductCategoryForm from "./product-category-form";
import { ProductCategoryRow } from "./product-category-type";
import { useTranslation } from "react-i18next";

const ProductCategoryTable: FC = () => {
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
        useApiQuery<PaginatedApiResponse<ProductCategoryRow>>({
            queryKey: ["product-categories"],
            url: "product-categories",
            params,
        });

    const productCategories = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `${t("product_category.title_plural")} (${pagination.total})`
        : t("product_category.title_plural");

    const toolbar: DataTableToolbarConfig = {
        title: toolbarTitle,
        features: {
            columns: true,
            add: ProductCategoryForm,
        },
    };

    return (
        <DataTable
            data={productCategories}
            setFilter={setFilter}
            columns={ProductCategoryColumns}
            toolbar={toolbar}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
        />
    );
};

export default ProductCategoryTable;

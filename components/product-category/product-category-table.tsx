"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
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

    return (
        <DataTable
            data={productCategories}
            setFilter={setFilter}
            columns={ProductCategoryColumns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={ProductCategoryForm}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default ProductCategoryTable;

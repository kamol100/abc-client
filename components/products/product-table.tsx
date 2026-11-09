"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useProductColumns } from "@/components/products/product-column";
import ProductFilterSchema from "@/components/products/product-filter-schema";
import { ProductRow } from "@/components/products/product-type";
import ProductsToolbarActions from "@/components/products/products-toolbar-actions";

const ProductTable: FC = () => {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue],
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ProductRow>>({
            queryKey: ["products"],
            url: "products",
            params,
        });

    const products = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const columns = useProductColumns(pagination);

    const toolbarTitle = pagination?.total
        ? `${t("product.title_plural")} (${pagination.total})`
        : t("product.title_plural");

    return (
        <DataTable
            data={products}
            columns={columns}
            setFilter={setFilter}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading || isFetching}
            isFetching={isFetching}
            queryKey="products"
            form={ProductsToolbarActions}
            toolbarOptions={{ filter: ProductFilterSchema() }}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default ProductTable;

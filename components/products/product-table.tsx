"use client";

import { usePermissions } from "@/context/app-provider";
import ProductFeedback, { ProductBackgroundError } from "@/components/products/product-feedback";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { PrefixSettingsButton } from "@/components/settings/ui/settings-button";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useProductColumns } from "@/components/products/product-column";
import ProductFilterSchema from "@/components/products/product-filter-schema";
import { ProductRow } from "@/components/products/product-type";
import ProductsToolbarActions, { ProductMovementButtons } from "@/components/products/products-toolbar-actions";

const ProductTable: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const allowed = hasPermission("products.access");
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue],
    );

    const { data, isLoading, isFetching, isError, refetch, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ProductRow>>({
            queryKey: ["products"],
            url: "products",
            enabled: allowed,
            params,
        });

    const products = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const columns = useProductColumns(pagination);

    const toolbarTitle = pagination?.total
        ? `${t("product.title_plural")} (${pagination.total})`
        : t("product.title_plural");

    if (!allowed) return <ProductFeedback denied />;
    if (isError && !data) return <ProductFeedback retry={() => void refetch()} />;

    const toolbar: DataTableToolbarConfig = {
        title: toolbarTitle,
        center: [
            {
                key: "product-movement",
                node: <ProductMovementButtons />,
                show: hasPermission("products-in.create") || hasPermission("products-out.create"),
                mobile: "actions",
                inFilterRow: false,
            },
        ],
        end: [
            { key: "prefix-settings-button", inFilterRow: false, node: <PrefixSettingsButton field="product_code_prefix" /> },
        ],
        features: {
            columns: true,
            filter: { filter: ProductFilterSchema() },
            add: ProductsToolbarActions,
        },
        mobileActions: "row",
    };

    return (
        <>
            <ProductBackgroundError failed={isError} retry={refetch} />
            <DataTable
                data={products}
                columns={columns}
                setFilter={setFilter}
                toolbar={toolbar}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="products"
            />
        </>
    );
};

export default ProductTable;

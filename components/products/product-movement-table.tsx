"use client";

import { usePermissions } from "@/context/app-provider";
import ProductFeedback, { ProductBackgroundError } from "@/components/products/product-feedback";
import { FC, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import MyButton from "@/components/my-button";
import ProductReportsSummary from "@/components/products/product-reports-summary";
import ProductMovementFilterSchema, {
    ProductMovementMode,
} from "@/components/products/product-movement-filter-schema";
import { useProductMovementColumns } from "@/components/products/product-movement-column";
import { ProductMovementListApiResponse } from "@/components/products/product-movement-type";

type ProductMovementTableProps = {
    mode: ProductMovementMode;
    productId: string;
    backUrl?: string;
};

const ProductMovementTable: FC<ProductMovementTableProps> = ({
    mode,
    productId,
    backUrl,
}) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const allowed = hasPermission(`products-${mode}.access`);
    const [filterValue, setFilter] = useState<string | null>(null);

    const params = useMemo(() => {
        if (!filterValue) return undefined;
        return Object.fromEntries(
            new URLSearchParams(filterValue),
        ) as Record<string, string>;
    }, [filterValue]);

    const queryKeyRoot = mode === "in" ? "products-in" : "products-out";
    const url = `${queryKeyRoot}/${productId}`;

    const { data, isLoading, isFetching, isError, refetch, setCurrentPage } =
        useApiQuery<ProductMovementListApiResponse>({
            queryKey: [queryKeyRoot, productId],
            url,
            enabled: allowed,
            params,
        });

    const rows = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const reports = data?.data?.reports;
    const columns = useProductMovementColumns({ mode });

    const toolbarOptions = useMemo(
        () => ({
            filter: ProductMovementFilterSchema(mode),
        }),
        [mode],
    );

    const toolbarTitleKey =
        mode === "in"
            ? "product_movement.in_details_title"
            : "product_movement.out_details_title";
    const toolbarTitle = pagination?.total
        ? `${t(toolbarTitleKey)} (${pagination.total})`
        : t(toolbarTitleKey);

    if (!allowed) return <ProductFeedback denied />;
    if (isError && !data) return <ProductFeedback retry={() => void refetch()} />;

    const BackButton = () => (
        <MyButton
            action="cancel"
            icon={false}
            variant="outline"
            size="icon"
            className="h-9 w-9"
            url={backUrl}
            tooltip={t("product_movement.actions.back_to_products")}
            aria-label={t("product_movement.actions.back_to_products")}
        >
            <ArrowLeft className="h-4 w-4" />
        </MyButton>
    );

    const toolbar: DataTableToolbarConfig = {
        title: toolbarTitle,
        center: [
            {
                key: "totals",
                node: <ProductReportsSummary reports={reports} isLoading={isLoading} />,
            },
        ],
        page: "product_movements",
        features: {
            columns: true,
            filter: toolbarOptions,
            add: backUrl ? BackButton : undefined,
        },
    };

    return (
        <div className="space-y-4">
            <ProductBackgroundError failed={isError} retry={refetch} />

            <DataTable
                data={rows}
                setFilter={setFilter}
                columns={columns}
                toolbar={toolbar}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey={queryKeyRoot}
            />
        </div>
    );
};

export default ProductMovementTable;

"use client";

import { FC, ReactNode, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
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
    leading?: ReactNode;
};

const ProductMovementTable: FC<ProductMovementTableProps> = ({
    mode,
    productId,
    backUrl,
    leading,
}) => {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);

    const params = useMemo(() => {
        if (!filterValue) return undefined;
        return Object.fromEntries(
            new URLSearchParams(filterValue),
        ) as Record<string, string>;
    }, [filterValue]);

    const queryKeyRoot = mode === "in" ? "products-in" : "products-out";
    const url = `${queryKeyRoot}/${productId}`;

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<ProductMovementListApiResponse>({
            queryKey: [queryKeyRoot, productId],
            url,
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

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {leading}
                <div className="ml-auto flex items-center gap-2">
                    <ProductReportsSummary reports={reports} isLoading={isLoading} />
                    {backUrl ? (
                        <MyButton
                            action="cancel"
                            icon={false}
                            variant="default"
                            size="icon"
                            url={backUrl}
                            tooltip={t("product_movement.actions.back_to_products")}
                            aria-label={t("product_movement.actions.back_to_products")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </MyButton>
                    ) : null}
                </div>
            </div>

            <DataTable
                data={rows}
                setFilter={setFilter}
                columns={columns}
                toolbarOptions={toolbarOptions}
                toggleColumns={true}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey={queryKeyRoot}
                toolbarTitle={toolbarTitle}
            />
        </div>
    );
};

export default ProductMovementTable;

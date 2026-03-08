"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import Card from "@/components/card";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, toNumber } from "@/lib/helper/helper";
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
    const columns = useProductMovementColumns({ mode, pagination });

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

    const summaryTotalPrice =
        mode === "in"
            ? toNumber(reports?.product_in_current_total_price)
            : toNumber(reports?.product_out_current_total_price);
    const summaryTotalQuantity =
        mode === "in"
            ? toNumber(reports?.product_in_current_quantity)
            : toNumber(reports?.product_out_current_quantity);

    return (
        <div className="space-y-4">
            {isLoading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Card>
                        <CardContent className="p-4 space-y-1">
                            <p className="text-xs text-muted-foreground">
                                {t("product_movement.summary.total_price")}
                            </p>
                            <p className="text-xl font-semibold text-primary">
                                ৳{formatMoney(summaryTotalPrice)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 space-y-1">
                            <p className="text-xs text-muted-foreground">
                                {t("product_movement.summary.total_quantity")}
                            </p>
                            <p className="text-xl font-semibold">{summaryTotalQuantity}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

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

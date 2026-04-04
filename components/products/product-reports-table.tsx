"use client";

import { FC, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import useApiQuery from "@/hooks/use-api-query";
import { cellIndex, formatMoney, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import MyButton from "@/components/my-button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import MyTooltip from "@/components/my-tooltip";
import ProductSerialDialog from "@/components/products/product-serial-dialog";
import ProductReportsFilterSchema from "@/components/products/product-reports-filter-schema";
import ProductReportsSummary from "@/components/products/product-reports-summary";
import {
    ProductReportRow,
    ProductReportsApiResponse,
} from "@/components/products/product-reports-type";
import type { ProductMovementMode } from "@/components/products/product-movement-filter-schema";

type ProductReportsTableProps = {
    mode: ProductMovementMode;
    toolbarTitleKey: string;
    showCreateAction?: boolean;
};

const STATUS_STYLES: Record<string, string> = {
    new: "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
    old: "bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    replace:
        "bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
};

function useProductReportsColumns(
    mode: ProductMovementMode,
    pagination?: Pagination,
): ColumnDef<ProductReportRow>[] {
    const { t } = useTranslation();

    return useMemo(
        () => [
            {
                id: "sl",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.sl"
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-medium">{cellIndex(row.index, pagination)}</span>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                id: "date",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.date"
                    />
                ),
                cell: ({ row }) => (
                    <span>{mode === "in" ? row.original.purchase_date : row.original.out_date}</span>
                ),
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.status"
                    />
                ),
                cell: ({ row }) => {
                    const status = String(row.original.status ?? "").toLowerCase();
                    if (!status) return <span>-</span>;

                    return (
                        <Badge className={cn("capitalize", STATUS_STYLES[status])}>
                            {t(`product_in.status.${status}`, { defaultValue: status })}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "vendor.name",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.vendor"
                    />
                ),
                cell: ({ row }) => <span>{row.original.vendor?.name ?? "-"}</span>,
                enableSorting: false,
            },
            {
                accessorKey: "quantity",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.quantity"
                    />
                ),
                cell: ({ row }) => <span>{toNumber(row.original.quantity)}</span>,
            },
            {
                accessorKey: "unit_price",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.unit_price"
                    />
                ),
                cell: ({ row }) => <span>৳{formatMoney(row.original.unit_price)}</span>,
            },
            {
                accessorKey: "total_price",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.total_price"
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-medium text-primary">
                        ৳{formatMoney(row.original.total_price)}
                    </span>
                ),
            },
            {
                id: "serial",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.serial"
                    />
                ),
                cell: ({ row }) => {
                    const serialItems = Array.isArray(row.original.serial)
                        ? row.original.serial
                        : [];
                    return serialItems.length > 0 ? (
                        <ProductSerialDialog
                            serial={serialItems}
                            productName={row.original.product?.name}
                        />
                    ) : (
                        <span>-</span>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: "note",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_reports.columns.note"
                    />
                ),
                cell: ({ row }) => (
                    <MyTooltip
                        content={row.original.note || "-"}
                        placement="top"
                        className="max-w-sm break-words"
                    >
                        <p className="max-w-[220px] line-clamp-1 text-sm cursor-default">
                            {row.original.note || "-"}
                        </p>
                    </MyTooltip>
                ),
                enableSorting: false,
            },
        ],
        [mode, pagination, t],
    );
}

const ProductReportsTable: FC<ProductReportsTableProps> = ({
    mode,
    toolbarTitleKey,
    showCreateAction = false,
}) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [filterValue, setFilter] = useState<string | null>(null);

    const params = useMemo(() => {
        if (!filterValue) return undefined;
        return Object.fromEntries(
            new URLSearchParams(filterValue),
        ) as Record<string, string>;
    }, [filterValue]);

    const queryKeyRoot = mode === "in" ? "products-in-reports" : "products-out-reports";
    const endpoint = mode === "in" ? "products-in/reports" : "products-out/reports";

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<ProductReportsApiResponse>({
            queryKey: [queryKeyRoot],
            url: endpoint,
            params,
        });

    const rows = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const reports = data?.data?.reports;
    const columns = useProductReportsColumns(mode, pagination);

    const toolbarOptions = useMemo(
        () => ({
            filter: ProductReportsFilterSchema(mode),
        }),
        [mode],
    );

    const toolbarTitle = pagination?.total
        ? `${t(toolbarTitleKey)} (${pagination.total})`
        : t(toolbarTitleKey);

    const createPermission =
        mode === "in" ? "products-in.create" : "products-out.create";
    const createUrl = mode === "in" ? "/products/in" : "/products/out";
    const createTitleKey = mode === "in" ? "product_in.title" : "product_out.title";

    const CreateAction = () => (
        <MyButton
            action="create"
            size="default"
            variant="outline"
            title={t(createTitleKey)}
            url={createUrl}
        />
    );

    return (
        <div className="space-y-4">
            {(isLoading || reports) && (
                <ProductReportsSummary reports={reports} mode={mode} isLoading={isLoading} />
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
                form={
                    showCreateAction && hasPermission(createPermission)
                        ? CreateAction
                        : undefined
                }
            />
        </div>
    );
};

export default ProductReportsTable;

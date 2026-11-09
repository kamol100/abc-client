"use client";

import { FC, ReactNode, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import useApiQuery from "@/hooks/use-api-query";
import { formatMoney, toNumber } from "@/lib/helper/helper";
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
    header?: ReactNode;
};

const STATUS_STYLES: Record<string, string> = {
    new: "theme-badge-info",
    old: "theme-badge-warning",
    replace: "theme-badge-info",
};

function useProductReportsColumns(
    mode: ProductMovementMode,
): ColumnDef<ProductReportRow>[] {
    const { t } = useTranslation();

    return useMemo(
        () => [
            {
                id: "product_code",
                accessorFn: (row) => row.product?.product_code,
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product.product_code.label"
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.product?.product_code || "-"}</span>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                id: "product_name",
                accessorFn: (row) => row.product?.name,
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product.name.label"
                    />
                ),
                cell: ({ row }) => <span>{row.original.product?.name || "-"}</span>,
                enableSorting: false,
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
        [mode, t],
    );
}

const ProductReportsTable: FC<ProductReportsTableProps> = ({
    mode,
    toolbarTitleKey,
    showCreateAction = false,
    header,
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
    const columns = useProductReportsColumns(mode);

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
            {(header || isLoading || reports) && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {header}
                    {(isLoading || reports) && (
                        <ProductReportsSummary
                            reports={reports}
                            isLoading={isLoading}
                            className="ml-auto"
                        />
                    )}
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

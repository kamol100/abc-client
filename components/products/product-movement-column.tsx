"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import { cellIndex, formatMoney, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import { Badge } from "@/components/ui/badge";
import MyTooltip from "@/components/my-tooltip";
import ProductSerialDialog from "@/components/products/product-serial-dialog";
import {
    ProductMovementRow,
} from "@/components/products/product-movement-type";
import type { ProductMovementMode } from "@/components/products/product-movement-filter-schema";

const STATUS_STYLES: Record<string, string> = {
    new: "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
    old: "bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    replace:
        "bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
};

type UseProductMovementColumnsOptions = {
    mode: ProductMovementMode;
    pagination?: Pagination;
};

export function useProductMovementColumns({
    mode,
    pagination,
}: UseProductMovementColumnsOptions): ColumnDef<ProductMovementRow>[] {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    return useMemo(() => {
        const baseKey = mode === "in" ? "products-in" : "products-out";
        const canDeletePermission =
            mode === "in" ? "products-in.delete" : "products-out.delete";
        const apiBase = mode === "in" ? "/products-in" : "/products-out";

        return [
            {
                id: "sl",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.sl"
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-medium">{cellIndex(row.index, pagination)}</span>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "product.name",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.product"
                    />
                ),
                cell: ({ row }) => {
                    const status = String(row.original.status ?? "").toLowerCase();
                    return (
                        <div className="space-y-1">
                            <p className="font-medium">{row.original.product?.name ?? "-"}</p>
                            {status && (
                                <Badge className={cn("capitalize", STATUS_STYLES[status])}>
                                    {t(`product_in.status.${status}`, { defaultValue: status })}
                                </Badge>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                id: "date_by",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.date_and_by"
                    />
                ),
                cell: ({ row }) => {
                    const dateValue =
                        mode === "in" ? row.original.purchase_date : row.original.out_date;
                    const byName =
                        mode === "in"
                            ? row.original.purchaseBy?.name
                            : row.original.receivedBy?.name;

                    return (
                        <div className="space-y-1 text-sm">
                            <p>
                                <span className="text-muted-foreground">
                                    {mode === "in"
                                        ? t("product_movement.columns.purchase_date")
                                        : t("product_movement.columns.out_date")}
                                    :
                                </span>{" "}
                                {dateValue ?? "-"}
                            </p>
                            <p>
                                <span className="text-muted-foreground">
                                    {mode === "in"
                                        ? t("product_movement.columns.purchase_by")
                                        : t("product_movement.columns.received_by")}
                                    :
                                </span>{" "}
                                {byName ?? "-"}
                            </p>
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: "vendor.name",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.vendor"
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
                        title="product_movement.columns.quantity"
                    />
                ),
                cell: ({ row }) => <span>{toNumber(row.original.quantity)}</span>,
            },
            {
                accessorKey: "quantity_remaining",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.remaining"
                    />
                ),
                cell: ({ row }) => <span>{toNumber(row.original.quantity_remaining)}</span>,
            },
            {
                accessorKey: "unit_price",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.unit_price"
                    />
                ),
                cell: ({ row }) => <span>৳{formatMoney(row.original.unit_price)}</span>,
            },
            {
                accessorKey: "total_price",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.total_price"
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-medium text-primary">
                        ৳{formatMoney(row.original.total_price)}
                    </span>
                ),
            },
            {
                accessorKey: "unit_sell_price",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.selling_price"
                    />
                ),
                cell: ({ row }) => <span>৳{formatMoney(row.original.unit_sell_price)}</span>,
            },
            {
                accessorKey: "note",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.note"
                    />
                ),
                cell: ({ row }) => {
                    const note = row.original.note ?? "";
                    return (
                        <MyTooltip
                            content={note || "-"}
                            placement="top"
                            className="max-w-sm break-words"
                        >
                            <p className="max-w-[220px] line-clamp-1 text-sm cursor-default">
                                {note || "-"}
                            </p>
                        </MyTooltip>
                    );
                },
                enableSorting: false,
            },
            {
                id: "serial",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.serial"
                    />
                ),
                cell: ({ row }) => {
                    const serialItems = Array.isArray(row.original.serial)
                        ? row.original.serial
                        : [];
                    if (serialItems.length === 0) {
                        return <span className="text-sm text-muted-foreground">-</span>;
                    }
                    return (
                        <ProductSerialDialog
                            serial={serialItems}
                            productName={row.original.product?.name}
                        />
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: "staff.name",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="product_movement.columns.entry_by"
                    />
                ),
                cell: ({ row }) => <span>{row.original.staff?.name ?? "-"}</span>,
                enableSorting: false,
            },
            {
                id: "actions",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        className="flex justify-end mr-2"
                        title="common.actions"
                    />
                ),
                cell: ({ row }) => {
                    const canDelete = hasPermission(canDeletePermission);
                    if (!canDelete) return null;

                    return (
                        <div className="flex justify-end mr-2">
                            <DeleteModal
                                api_url={`${apiBase}/${row.original.id}`}
                                keys={`products,${baseKey}`}
                                confirmMessage="product_movement.actions.delete_confirmation"
                                buttonText="common.confirm_delete"
                            />
                        </div>
                    );
                },
                enableSorting: false,
                enableHiding: false,
            },
        ];
    }, [hasPermission, mode, pagination, t]);
}

"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import MyButton from "@/components/my-button";
import ProductForm from "@/components/products/product-form";
import { ProductRow } from "@/components/products/product-type";
import { cellIndex } from "@/lib/helper/helper";

export function useProductColumns(pagination?: Pagination): ColumnDef<ProductRow>[] {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    return [
        {
            id: "sl",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.sl" />
            ),
            cell: ({ row }) => (
                <div className="font-medium">{cellIndex(row.index, pagination)}</div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.name.label" />
            ),
            cell: ({ row }) => (
                <div className="capitalize">{row.original.name}</div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "vat",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.vat.label" />
            ),
            cell: ({ row }) => (
                <div>{Number(row.original.vat ?? 0)}%</div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "has_serial",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.has_serial.label" />
            ),
            cell: ({ row }) => (
                <div>
                    {Number(row.original.has_serial ?? 0) === 1
                        ? t("common.yes")
                        : t("common.no")}
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "category.name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.product_category.label" />
            ),
            cell: ({ row }) => (
                <div>{row.original.category?.name ?? "-"}</div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "unitType.name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.unit_type.label" />
            ),
            cell: ({ row }) => (
                <div>{row.original.unitType?.name ?? "-"}</div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "stock_in_quantity",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.stock_in.label" />
            ),
            cell: ({ row }) => {
                const quantity = Number(row.original.stock_in_quantity ?? 0);
                return (
                    <Link
                        href={`/products/in/${row.original.id}`}
                        className="text-primary hover:underline"
                    >
                        {quantity}
                    </Link>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "stock_out_quantity",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.stock_out.label" />
            ),
            cell: ({ row }) => {
                const quantity = Number(row.original.stock_out_quantity ?? 0);
                return (
                    <Link
                        href={`/products/out/${row.original.id}`}
                        className="text-primary hover:underline"
                    >
                        {quantity}
                    </Link>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: "stock_in_remaining",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="product.remaining.label" />
            ),
            cell: ({ row }) => (
                <div>{Number(row.original.stock_in_remaining ?? 0)}</div>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    className="flex justify-end capitalize mr-3"
                    title="common.actions"
                />
            ),
            cell: ({ row }) => {
                const product = row.original;
                const canEdit = hasPermission("products.edit");
                const canProductIn = hasPermission("products-in.create");
                const canProductOut = hasPermission("products-out.create");
                const canDelete =
                    hasPermission("products.delete") &&
                    Number(product.stock_in_quantity ?? 0) === 0;

                if (!canEdit && !canDelete && !canProductIn && !canProductOut) {
                    return null;
                }

                return (
                    <div className="flex items-center justify-end gap-2 mr-3">
                        {canEdit && (
                            <ProductForm
                                mode="edit"
                                data={{ id: product.id }}
                                api="/products"
                                method="PUT"
                            />
                        )}
                        {canProductIn && (
                            <MyButton
                                action="create"
                                variant="outline"
                                size="sm"
                                url={`/products/in`}
                                tooltip={t("product_in.title")}
                                aria-label={t("product_in.title")}
                            />
                        )}
                        {canProductOut && (
                            <MyButton
                                action="minus"
                                variant="outline"
                                size="sm"
                                url={`/products/out`}
                                tooltip={t("product_out.title")}
                                aria-label={t("product_out.title")}
                            />
                        )}
                        {canDelete && (
                            <DeleteModal
                                api_url={`/products/${product.id}`}
                                keys="products"
                                tooltip={t("common.delete")}
                                confirmMessage="product.delete_confirmation"
                                buttonText="common.confirm_delete"
                            />
                        )}
                    </div>
                );
            },
        },
    ];
}

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteModal } from "../delete-modal";
import ProductCategoryForm from "./product-category-form";
import { ProductCategoryRow } from "./product-category-type";

export const ProductCategoryColumns: ColumnDef<ProductCategoryRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="product_category.name.label" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.original.name}</div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="product_category.description.label" />
        ),
        cell: ({ row }) => (
            <div>{row.original.description ?? ""}</div>
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
            const productCategory = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <ProductCategoryForm
                        mode="edit"
                        data={{ id: productCategory.id }}
                        api="/product-categories"
                        method="PUT"
                    />
                    {productCategory.deletable === 1 && (
                        <DeleteModal
                            api_url={`/product-categories/${productCategory.id}`}
                            keys="product-categories"
                            confirmMessage="product_category.delete_confirmation"
                            buttonText="common.confirm_delete"
                        />
                    )}
                </div>
            );
        },
    },
];

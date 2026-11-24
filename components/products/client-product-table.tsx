"use client";

import { FC, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Banknote } from "lucide-react";
import { usePermissions } from "@/context/app-provider";
import useApiQuery from "@/hooks/use-api-query";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import SummaryChip from "@/components/summary-chip";
import ProductSerialDialog from "@/components/products/product-serial-dialog";
import ProductMovementDeleteAction from "@/components/products/product-movement-delete-action";
import type {
    ProductReportRow,
    ProductReportsApiResponse,
} from "@/components/products/product-reports-type";

/** Products issued to one client (stock-out rows with this client), for the client profile. */
export function useClientProductColumns(): ColumnDef<ProductReportRow>[] {
    return useMemo(
        () => [
            {
                id: "out_date",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_movement.columns.out_date" />
                ),
                cell: ({ row }) => <span className="whitespace-nowrap">{row.original.out_date ?? "-"}</span>,
                enableSorting: false,
            },
            {
                id: "product",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_movement.columns.product" />
                ),
                cell: ({ row }) => (
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{row.original.product?.name ?? "-"}</span>
                        {row.original.product?.product_code && (
                            <span className="text-xs text-muted-foreground">{row.original.product.product_code}</span>
                        )}
                    </div>
                ),
                enableSorting: false,
            },
            {
                id: "quantity",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_movement.columns.quantity" />
                ),
                cell: ({ row }) => <span>{toNumber(row.original.quantity)}</span>,
                enableSorting: false,
            },
            {
                id: "unit_price",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_movement.columns.unit_price" />
                ),
                cell: ({ row }) => <span>৳{formatMoney(row.original.unit_price)}</span>,
                enableSorting: false,
            },
            {
                id: "vat",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_out.line.vat.label" />
                ),
                cell: ({ row }) => <span>{toNumber(row.original.vat)}%</span>,
                enableSorting: false,
            },
            {
                id: "discount",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_out.line.discount.label" />
                ),
                cell: ({ row }) => <span>৳{formatMoney(row.original.discount)}</span>,
                enableSorting: false,
            },
            {
                id: "total_price",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_movement.columns.total_price" />
                ),
                cell: ({ row }) => <span className="font-semibold">৳{formatMoney(row.original.total_price)}</span>,
                enableSorting: false,
            },
            {
                id: "serial",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_movement.columns.serial" />
                ),
                cell: ({ row }) => {
                    const serials = Array.isArray(row.original.serial) ? row.original.serial : [];
                    return serials.length > 0 ? (
                        <ProductSerialDialog serial={serials} productName={row.original.product?.name} />
                    ) : (
                        <span>-</span>
                    );
                },
                enableSorting: false,
            },
            {
                id: "received_by",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="product_movement.columns.received_by" />
                ),
                cell: ({ row }) => <span>{row.original.receivedBy?.name ?? "-"}</span>,
                enableSorting: false,
            },
            {
                id: "invoice",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="client.products.invoice" />
                ),
                cell: ({ row }) => <span>{row.original.invoice?.trackID ?? "-"}</span>,
                enableSorting: false,
            },
            {
                id: "actions",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} className="flex justify-end mr-2" title="common.actions" />
                ),
                cell: ({ row }) => <ProductMovementDeleteAction mode="out" id={row.original.id} />,
                enableSorting: false,
                enableHiding: false,
            },
        ],
        [],
    );
}

type ClientProductTableProps = {
    clientUuid: string;
};

const ClientProductTable: FC<ClientProductTableProps> = ({ clientUuid }) => {
    const { hasPermission } = usePermissions();
    const allowed = hasPermission("products-out.report");
    const [, setFilter] = useState<string | null>(null);
    const columns = useClientProductColumns();
    const params = useMemo(() => ({ client_uuid: clientUuid }), [clientUuid]);

    // Same key root as the stock-out report, so deleting a row refreshes this table too.
    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<ProductReportsApiResponse>({
        queryKey: ["products-out-reports", "client", clientUuid],
        url: "products-out/reports",
        params,
        enabled: allowed,
    });

    if (!allowed) return null;

    const rows = data?.data?.data ?? [];

    return (
        <div className="space-y-4">
            <div className="flex">
                <SummaryChip
                    icon={Banknote}
                    label="client.products.total"
                    amount={toNumber(data?.data?.reports?.total_price)}
                    isLoading={isLoading}
                />
            </div>
            <DataTable
                data={rows}
                setFilter={setFilter}
                columns={columns}
                toolbar={false}
                pagination={data?.data?.pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="client-products"
            />
        </div>
    );
};

export default ClientProductTable;

"use client";

import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ProductSerialItem } from "@/components/products/product-movement-type";

type ProductSerialDialogProps = {
    serial: ProductSerialItem[];
    productName?: string | null;
};

const ProductSerialDialog: FC<ProductSerialDialogProps> = ({
    serial,
    productName,
}) => {
    const { t } = useTranslation();

    const { inCount, outCount } = useMemo(() => {
        const out = serial.filter((item) => !!item.out_date).length;
        const inStock = Math.max(0, serial.length - out);
        return { inCount: inStock, outCount: out };
    }, [serial]);

    if (serial.length === 0) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button type="button" className="inline-flex">
                    <Badge
                        variant="secondary"
                        className="cursor-pointer gap-1 font-medium hover:bg-secondary/80"
                    >
                        {inCount > 0 && (
                            <span className="text-green-600 dark:text-green-400">
                                {inCount}
                            </span>
                        )}
                        {inCount > 0 && outCount > 0 && <span>|</span>}
                        {outCount > 0 && (
                            <span className="text-red-600 dark:text-red-400">{outCount}</span>
                        )}
                    </Badge>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {productName
                            ? `${productName} - ${t("product_serial.title")}`
                            : t("product_serial.title")}
                    </DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("product_serial.columns.serial")}</TableHead>
                                <TableHead>{t("product_serial.columns.status")}</TableHead>
                                <TableHead>{t("product_serial.columns.purchase_date")}</TableHead>
                                <TableHead>{t("product_serial.columns.out_date")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {serial.map((item) => {
                                const isOut = !!item.out_date;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.serial_number ?? "-"}</TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    isOut
                                                        ? "text-red-600 dark:text-red-400 font-medium"
                                                        : "text-green-600 dark:text-green-400 font-medium"
                                                }
                                            >
                                                {isOut
                                                    ? t("product_serial.status.out")
                                                    : t("product_serial.status.in_stock")}
                                            </span>
                                        </TableCell>
                                        <TableCell>{item.purchase_date ?? "-"}</TableCell>
                                        <TableCell>{item.out_date ?? "-"}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProductSerialDialog;

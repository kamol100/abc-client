"use client";

import { FC, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    calculateInvoiceTotals,
    formatMoney,
} from "@/lib/helper/helper";
import type { InvoiceFormState } from "@/components/invoices/invoice-type";

const InvoiceTotals: FC = () => {
    const { t } = useTranslation();
    const { control } = useFormContext<InvoiceFormState>();
    const lines = useWatch({
        control,
        name: "lines",
    }) ?? [];
    const discount = useWatch({
        control,
        name: "discount",
    });

    const totals = useMemo(
        () => calculateInvoiceTotals(lines, discount),
        [lines, discount],
    );

    return (
        <div className="rounded-md border bg-muted/30 p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    {t("invoice.reports.sub_total")}
                </span>
                <span className="font-medium">৳{formatMoney(totals.sub_total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    {t("invoice.reports.discount")}
                </span>
                <span className="font-medium">
                    - ৳{formatMoney(totals.total_discount)}
                </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 font-semibold">
                <span>{t("invoice.reports.total")}</span>
                <span className="text-primary">
                    ৳{formatMoney(totals.after_discount_amount)}
                </span>
            </div>
        </div>
    );
};

export default InvoiceTotals;

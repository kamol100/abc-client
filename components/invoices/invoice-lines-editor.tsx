"use client";

import { FC } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ActionButton from "@/components/action-button";
import InputField from "@/components/form/input-field";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import type { InvoiceFormValues } from "@/components/invoices/invoice-type";

const defaultLineItem = {
    description: "",
    amount: 0,
    quantity: 1,
    discount: 0,
    order: 0,
    uuid: null,
};

const InvoiceLinesEditor: FC = () => {
    const { t } = useTranslation();
    const { control } = useFormContext<InvoiceFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines",
    });
    const lines = useWatch({
        control,
        name: "lines",
    }) ?? [];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("invoice.lines.title")}</h3>
                <ActionButton
                    action="add"
                    variant="outline"
                    size="sm"
                    onClick={() => append(defaultLineItem)}
                    title={t("invoice.lines.add")}
                />
            </div>

            <div className="hidden md:grid grid-cols-12 gap-3 rounded-md border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span className="col-span-5">{t("invoice.line.description.label")}</span>
                <span className="col-span-2">{t("invoice.line.amount.label")}</span>
                <span className="col-span-1">{t("invoice.line.quantity.label")}</span>
                <span className="col-span-2">{t("invoice.line.discount.label")}</span>
                <span className="col-span-1 text-right">{t("invoice.line.total.label")}</span>
                <span className="col-span-1 text-right">{t("common.actions")}</span>
            </div>

            {fields.map((field, index) => {
                const currentLine = lines[index] ?? defaultLineItem;
                const lineTotal =
                    toNumber(currentLine.amount) * toNumber(currentLine.quantity);

                return (
                    <div key={field.id} className="rounded-md border p-3">
                        <div className="mb-3 flex items-center justify-between md:hidden">
                            <p className="text-xs font-medium text-muted-foreground">
                                {t("invoice.lines.item", { index: index + 1 })}
                            </p>
                            <ActionButton
                                action="delete"
                                variant="outline"
                                size="sm"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 1}
                                title={t("invoice.lines.remove")}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-5">
                                <InputField
                                    name={`lines.${index}.description`}
                                    label={{
                                        labelText: "invoice.line.description.label",
                                        mandatory: true,
                                    }}
                                    placeholder="invoice.line.description.placeholder"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <InputField
                                    type="number"
                                    name={`lines.${index}.amount`}
                                    label={{
                                        labelText: "invoice.line.amount.label",
                                        mandatory: true,
                                    }}
                                    placeholder="invoice.line.amount.placeholder"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <InputField
                                    type="number"
                                    name={`lines.${index}.quantity`}
                                    label={{
                                        labelText: "invoice.line.quantity.label",
                                        mandatory: true,
                                    }}
                                    placeholder="invoice.line.quantity.placeholder"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <InputField
                                    type="number"
                                    name={`lines.${index}.discount`}
                                    label={{ labelText: "invoice.line.discount.label" }}
                                    placeholder="invoice.line.discount.placeholder"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {t("invoice.line.total.label")}
                                    </p>
                                    <div className="flex h-10 items-center justify-end rounded-md border bg-muted/40 px-3 text-sm font-semibold">
                                        ৳{formatMoney(lineTotal)}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex md:col-span-1 items-end justify-end">
                                <ActionButton
                                    action="delete"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    disabled={fields.length <= 1}
                                    aria-label={t("invoice.lines.remove")}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InvoiceLinesEditor;

"use client";

import { FC, useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import InputField from "@/components/form/input-field";
import { toNumber } from "@/lib/helper/helper";
import type { InvoiceFormState } from "@/components/invoices/invoice-type";

const defaultLineItem = {
    description: "",
    amount: 0,
    quantity: 1,
    discount: 0,
    order: 0,
    total_amount: 0,
    uuid: null,
};

const InvoiceLinesEditor: FC = () => {
    const { t } = useTranslation();
    const { control, setValue } = useFormContext<InvoiceFormState>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines",
    });
    const lines = useWatch({
        control,
        name: "lines",
    }) ?? [];

    useEffect(() => {
        lines.forEach((line, index) => {
            const computedTotalAmount =
                toNumber(line?.amount) * toNumber(line?.quantity);
            if (
                line?.total_amount === undefined ||
                toNumber(line?.total_amount) !== computedTotalAmount
            ) {
                setValue(`lines.${index}.total_amount`, computedTotalAmount, {
                    shouldDirty: false,
                    shouldValidate: false,
                });
            }
        });
    }, [lines, setValue]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("invoice.lines.title")}</h3>
                <MyButton
                    action="add"
                    variant="default"
                    onClick={() => append(defaultLineItem)}
                    title={t("invoice.lines.add")}
                />
            </div>

            <div className="hidden md:grid grid-cols-12 gap-3 rounded-md border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span className="col-span-4">{t("invoice.line.description.label")}</span>
                <span className="col-span-2">{t("invoice.line.amount.label")}</span>
                <span className="col-span-1">{t("invoice.line.quantity.label")}</span>
                <span className="col-span-2">{t("invoice.line.discount.label")}</span>
                <span className="col-span-2 text-right">{t("invoice.line.total.label")}</span>
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
                            <MyButton
                                action="delete"
                                variant="outline"
                                size="sm"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 1}
                                title={t("invoice.lines.remove")}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:items-start">
                            <div className="md:col-span-4">
                                <InputField
                                    name={`lines.${index}.description`}
                                    label={{
                                        labelText: "invoice.line.description.label",
                                        mandatory: true,
                                    }}
                                    placeholder="invoice.line.description.placeholder"
                                    reserveErrorSpace={true}
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
                                    errorMessageEllipsis={true}
                                    reserveErrorSpace={true}
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
                                    errorMessageEllipsis={true}
                                    reserveErrorSpace={true}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <InputField
                                    type="number"
                                    name={`lines.${index}.discount`}
                                    label={{ labelText: "invoice.line.discount.label" }}
                                    placeholder="invoice.line.discount.placeholder"
                                    errorMessageEllipsis={true}
                                    reserveErrorSpace={true}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <InputField
                                    type="number"
                                    name={`lines.${index}.total_amount`}
                                    label={{ labelText: "invoice.line.total.label" }}
                                    placeholder="invoice.line.total.placeholder"
                                    readOnly={true}
                                    defaultValue={lineTotal}
                                    reserveErrorSpace={true}
                                />
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-1 min-h-full">
                                <div className="hidden md:block min-h-6 shrink-0" aria-hidden />
                                <div className="hidden md:flex shrink-0">
                                    <MyButton
                                        action="delete"
                                        variant="outline"
                                        onClick={() => remove(index)}
                                        disabled={fields.length <= 1}
                                        aria-label={t("invoice.lines.remove")}
                                    />
                                </div>
                                <div className="min-h-[1.25rem] hidden md:block shrink-0" aria-hidden />
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InvoiceLinesEditor;

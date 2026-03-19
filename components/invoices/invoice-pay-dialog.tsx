"use client";

import dynamic from "next/dynamic";
import { FC, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import InputField from "@/components/form/input-field";
import RadioField from "@/components/form/radio-field";
import TextareaField from "@/components/form/textarea-field";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { formatMoney, parseApiError, toNumber } from "@/lib/helper/helper";
import {
    InvoiceDetail,
    InvoiceDetailSchema,
    InvoicePayFormInput,
    InvoicePayInput,
    InvoicePaySchema,
} from "./invoice-type";

const SelectDropdown = dynamic(() => import("@/components/select-dropdown"));

type InvoicePayDialogProps = {
    invoiceId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const toIsoDate = (value: string | Date | null | undefined): string => {
    if (!value) return new Date().toISOString().slice(0, 10);
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === "string" && value.includes("T")) return value.slice(0, 10);
    return value;
};

const InvoicePayDialog: FC<InvoicePayDialogProps> = ({
    invoiceId,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const form = useForm<InvoicePayFormInput>({
        resolver: zodResolver(InvoicePaySchema),
        defaultValues: {
            fund_id: 0,
            payment_date: new Date().toISOString().slice(0, 10),
            status: "paid",
            partial_amount: 0,
            transaction_id: "",
            reference: "",
            confirmation_sms: 0,
            note: "",
        },
    });

    const { watch, reset, handleSubmit, setError } = form;
    const status = watch("status");

    const {
        data: detailResponse,
        isLoading: isDetailLoading,
        isError: isDetailError,
        error: detailError,
    } = useApiQuery<ApiResponse<InvoiceDetail>>({
        queryKey: ["invoices", "detail", invoiceId, "pay"],
        url: `invoices/${invoiceId}`,
        pagination: false,
        enabled: open && !!invoiceId,
        staleTime: 10_000,
    });

    const invoice = useMemo(() => {
        if (!detailResponse?.data) return null;
        const parsed = InvoiceDetailSchema.safeParse(detailResponse.data);
        return parsed.success ? parsed.data : null;
    }, [detailResponse]);

    useEffect(() => {
        if (!invoice || !open) return;
        reset({
            fund_id: toNumber(invoice.fund_id ?? invoice.fund?.id) || 0,
            payment_date: toIsoDate(invoice.payment_date),
            status:
                invoice.status === "partial" || invoice.status === "partial_paid"
                    ? "partial_paid"
                    : "paid",
            partial_amount: toNumber(invoice.partial_amount),
            transaction_id: invoice.transaction_id ?? "",
            reference: invoice.reference ?? "",
            confirmation_sms: toNumber(invoice.confirmation_sms),
            note: invoice.note ?? "",
        });
    }, [invoice, open, reset]);

    const { mutateAsync: submitPay, isPending } = useApiMutation<
        unknown,
        InvoicePayInput
    >({
        url: `invoices/pay/${invoiceId}`,
        method: "PUT",
        invalidateKeys: "invoices,clients",
        successMessage: "invoice.pay.success",
        onSuccess: () => {
            onOpenChange(false);
        },
    });

    const dueAmount = useMemo(() => {
        if (!invoice) return 0;
        if (invoice.amount_due != null) return toNumber(invoice.amount_due);
        return toNumber(invoice.after_discount_amount) - toNumber(invoice.amount_paid);
    }, [invoice]);

    const onSubmit = async (values: InvoicePayInput) => {
        if (values.status === "partial_paid" && toNumber(values.partial_amount) > dueAmount) {
            setError("partial_amount", {
                message: t("invoice.pay.partial_amount.errors.max", {
                    amount: formatMoney(dueAmount),
                }),
            });
            return;
        }

        await submitPay({
            ...values,
            payment_date: toIsoDate(values.payment_date),
            partial_amount:
                values.status === "partial_paid" ? toNumber(values.partial_amount) : 0,
            transaction_id: values.transaction_id?.trim() || null,
            reference: values.reference?.trim() || null,
            note: values.note?.trim() || null,
        });
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            title="invoice.pay.title"
            size="2xl"
            loading={isPending}
            footer={({ close, loading }) => (
                <>
                    <MyButton
                        action="cancel"
                        variant="outline"
                        size="default"
                        onClick={close}
                        disabled={loading}
                        title={t("common.cancel")}
                    />
                    <MyButton
                        action="save"
                        variant="default"
                        size="default"
                        onClick={handleSubmit((data) => onSubmit(data as InvoicePayInput))}
                        loading={loading}
                        title={t("invoice.pay.submit")}
                    />
                </>
            )}
        >
            {isDetailLoading ? (
                <div className="space-y-3 py-1">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : isDetailError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {t(parseApiError(detailError) || "common.failed_to_load_data")}
                </div>
            ) : (
                <Form {...form}>
                    <div className="space-y-4">
                        <div className="rounded-md border p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        {t("invoice.pay.summary.client")}
                                    </p>
                                    <p className="font-medium">
                                        {invoice?.client?.name || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t("invoice.pay.summary.invoice_id")}
                                    </p>
                                    <p className="font-medium">{invoice?.trackID || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t("invoice.pay.summary.total")}
                                    </p>
                                    <p className="font-medium">
                                        ৳{formatMoney(invoice?.after_discount_amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t("invoice.pay.summary.due")}
                                    </p>
                                    <p className="font-semibold text-destructive">
                                        ৳{formatMoney(dueAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectDropdown
                                name="fund_id"
                                label={{
                                    labelText: "invoice.pay.fund.label",
                                    mandatory: true,
                                }}
                                placeholder="invoice.pay.fund.placeholder"
                                api="/dropdown-funds"
                            />
                            <InputField
                                name="payment_date"
                                type="date"
                                label={{
                                    labelText: "invoice.pay.payment_date.label",
                                    mandatory: true,
                                }}
                                placeholder="invoice.pay.payment_date.placeholder"
                            />
                            <RadioField
                                name="status"
                                label={{
                                    labelText: "invoice.pay.status.label",
                                }}
                                options={[
                                    {
                                        label: "invoice.pay.status.paid",
                                        value: "paid",
                                    },
                                    {
                                        label: "invoice.pay.status.partial_paid",
                                        value: "partial_paid",
                                    },
                                ]}
                                direction="row"
                                defaultValue="paid"
                            />
                            {status === "partial_paid" && (
                                <InputField
                                    name="partial_amount"
                                    type="number"
                                    label={{
                                        labelText: "invoice.pay.partial_amount.label",
                                        mandatory: true,
                                    }}
                                    placeholder="invoice.pay.partial_amount.placeholder"
                                />
                            )}
                            <InputField
                                name="transaction_id"
                                label={{ labelText: "invoice.pay.transaction_id.label" }}
                                placeholder="invoice.pay.transaction_id.placeholder"
                            />
                            <InputField
                                name="reference"
                                label={{ labelText: "invoice.pay.reference.label" }}
                                placeholder="invoice.pay.reference.placeholder"
                            />
                            <RadioField
                                name="confirmation_sms"
                                label={{
                                    labelText: "invoice.pay.confirmation_sms.label",
                                }}
                                options={[
                                    { label: "common.yes", value: 1 },
                                    { label: "common.no", value: 0 },
                                ]}
                                direction="row"
                                defaultValue="0"
                            />
                        </div>

                        <TextareaField
                            name="note"
                            label={{ labelText: "invoice.pay.note.label" }}
                            placeholder="invoice.pay.note.placeholder"
                            rows={2}
                        />
                    </div>
                </Form>
            )}
        </MyDialog>
    );
};

export default InvoicePayDialog;

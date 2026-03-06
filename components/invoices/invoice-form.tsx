"use client";

import dynamic from "next/dynamic";
import { FC, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ActionButton from "@/components/action-button";
import DatePicker from "@/components/form/DatePicker";
import InputField from "@/components/form/input-field";
import RadioField from "@/components/form/radio-field";
import TextareaField from "@/components/form/textarea-field";
import InvoiceLinesEditor from "@/components/invoices/invoice-lines-editor";
import InvoiceTotals from "@/components/invoices/invoice-totals";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import {
    calculateInvoiceTotals,
    parseApiError,
    toNumber,
} from "@/lib/helper/helper";
import {
    InvoiceDetail,
    InvoiceDetailSchema,
    InvoiceFormSchema,
    InvoiceFormValues,
    InvoicePayload,
    InvoicePayloadSchema,
    InvoiceStatusSchema,
} from "./invoice-type";
import InvoiceFormFieldSchema from "./invoice-form-schema";

const SelectDropdown = dynamic(() => import("@/components/select-dropdown"));

type InvoiceFormProps = {
    mode?: "create" | "edit";
    data?: {
        id: string | number;
    };
};

const defaultLine = {
    description: "",
    amount: 0,
    quantity: 1,
    discount: 0,
    order: 0,
    uuid: null,
};

const toApiDateString = (value: Date | string | null | undefined): string | null => {
    if (!value) return null;
    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    if (typeof value === "string") {
        if (value.includes("T")) return value.slice(0, 10);
        return value;
    }
    return null;
};

const toFormDate = (value: string | null | undefined): Date | undefined => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getDefaultValues = (): InvoiceFormValues => {
    const now = new Date();
    return {
        create_date: now,
        due_date: now,
        invoice_type_id: 0,
        client_id: 0,
        discount: 0,
        status: "due",
        partial_amount: 0,
        fund_id: null,
        payment_date: undefined,
        confirmation_sms: 0,
        note: "",
        lines: [{ ...defaultLine }],
    };
};

const mapInvoiceToFormValues = (invoice: InvoiceDetail): InvoiceFormValues => {
    const defaultValues = getDefaultValues();
    const statusCandidate =
        invoice.status === "partial" ? "partial_paid" : (invoice.status ?? "due");
    const parsedStatus = InvoiceStatusSchema.safeParse(statusCandidate);
    const status: InvoiceFormValues["status"] = parsedStatus.success
        ? parsedStatus.data
        : "due";

    const lineValues = (invoice.lines?.length ? invoice.lines : [defaultLine]).map(
        (line, index) => ({
            description: line.description ?? "",
            amount: toNumber(line.amount),
            quantity: Math.max(1, toNumber(line.quantity) || 1),
            discount: toNumber(line.discount),
            order: toNumber(line.order) || index,
            uuid: line.uuid ?? null,
        }),
    );

    return {
        ...defaultValues,
        create_date: toFormDate(invoice.create_date) ?? new Date(),
        due_date: toFormDate(invoice.due_date) ?? new Date(),
        invoice_type_id: toNumber(invoice.invoice_type_id ?? invoice.invoice_type?.id),
        client_id: toNumber(invoice.client_id ?? invoice.client?.id),
        discount: toNumber(invoice.discount),
        status,
        partial_amount: toNumber(invoice.partial_amount),
        fund_id: toNumber(invoice.fund_id ?? invoice.fund?.id) || null,
        payment_date: toFormDate(invoice.payment_date),
        confirmation_sms: toNumber(invoice.confirmation_sms),
        note: invoice.note ?? "",
        lines: lineValues,
    };
};

const buildPayload = (values: InvoiceFormValues): InvoicePayload => {
    const normalizedLines = values.lines.map((line, index) => ({
        description: line.description.trim(),
        amount: toNumber(line.amount),
        quantity: Math.max(1, Math.trunc(toNumber(line.quantity) || 1)),
        discount: toNumber(line.discount),
        order: line.order ?? index,
        uuid: line.uuid ?? null,
    }));
    const totals = calculateInvoiceTotals(normalizedLines, values.discount);

    const payload = {
        create_date: toApiDateString(values.create_date) ?? "",
        due_date: toApiDateString(values.due_date) ?? "",
        invoice_type_id: toNumber(values.invoice_type_id),
        client_id: toNumber(values.client_id),
        discount: toNumber(values.discount),
        status: values.status,
        partial_amount:
            values.status === "partial_paid" ? toNumber(values.partial_amount) : 0,
        fund_id:
            values.status === "paid" || values.status === "partial_paid"
                ? (toNumber(values.fund_id) || null)
                : null,
        payment_date:
            values.status === "paid" || values.status === "partial_paid"
                ? toApiDateString(values.payment_date)
                : null,
        confirmation_sms: toNumber(values.confirmation_sms),
        note: values.note ?? "",
        lines: normalizedLines,
        total_amount: totals.sub_total,
        line_total_discount: totals.line_total_discount,
        after_discount_amount: totals.after_discount_amount,
    };

    return InvoicePayloadSchema.parse(payload);
};

const InvoiceForm: FC<InvoiceFormProps> = ({ mode = "create", data }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const invoiceId = data?.id;

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(InvoiceFormSchema),
        mode: "onChange",
        defaultValues: getDefaultValues(),
    });

    const { handleSubmit, reset, watch } = form;
    const status = watch("status");

    const {
        data: detailResponse,
        isLoading: isDetailLoading,
        isError: isDetailError,
        error: detailError,
        refetch,
    } = useApiQuery<ApiResponse<InvoiceDetail>>({
        queryKey: ["invoices", "detail", invoiceId],
        url: `invoices/${invoiceId}`,
        pagination: false,
        enabled: mode === "edit" && !!invoiceId,
        staleTime: 30_000,
    });

    useEffect(() => {
        if (mode !== "edit" || !detailResponse?.data) return;
        const parsed = InvoiceDetailSchema.safeParse(detailResponse.data);
        if (!parsed.success) return;
        reset(mapInvoiceToFormValues(parsed.data));
    }, [mode, detailResponse, reset]);

    const { mutateAsync: submitInvoice, isPending } = useApiMutation<
        unknown,
        InvoicePayload
    >({
        url: mode === "edit" ? `invoices/${invoiceId}` : "invoices",
        method: mode === "edit" ? "PUT" : "POST",
        invalidateKeys: "invoices",
        successMessage:
            mode === "edit" ? "invoice.edit.success" : "invoice.create.success",
        onSuccess: () => {
            router.push("/invoices");
        },
    });

    const onSubmit = async (values: InvoiceFormValues) => {
        const payload = buildPayload(values);
        await submitInvoice(payload);
    };

    const statusOptions = useMemo(() => {
        const config = InvoiceFormFieldSchema().find(
            (field) => field.type === "dropdown" && field.name === "status",
        );
        if (config?.type === "dropdown" && config.options) return config.options;
        return [
            { value: "due", label: "invoice.status.due" },
            { value: "paid", label: "invoice.status.paid" },
            { value: "partial_paid", label: "invoice.status.partial_paid" },
        ];
    }, []);

    if (mode === "edit" && isDetailLoading) {
        return (
            <div className="w-full xl:w-4/5 mx-auto space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>
        );
    }

    if (mode === "edit" && isDetailError) {
        return (
            <div className="w-full xl:w-4/5 mx-auto rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">
                    {t(parseApiError(detailError) || "common.failed_to_load_data")}
                </p>
                <div className="mt-4 flex gap-2">
                    <ActionButton
                        action="cancel"
                        variant="outline"
                        size="default"
                        title={t("common.cancel")}
                        onClick={() => router.push("/invoices")}
                    />
                    <ActionButton
                        action="save"
                        size="default"
                        title={t("common.refresh")}
                        onClick={() => refetch()}
                    />
                </div>
            </div>
        );
    }

    const onError = (errors: FieldErrors<InvoiceFormValues>) => {
        console.log(errors);
    };

    return (
        <div className="w-full xl:w-4/5 mx-auto flex flex-col">
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4 pb-6">
                    <div className="rounded-md border p-4 sm:p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <DatePicker
                                name="create_date"
                                label={{
                                    labelText: "invoice.create_date.label",
                                    mandatory: true,
                                }}
                                placeholder={t("invoice.create_date.placeholder")}
                                mode="single"
                            />
                            <DatePicker
                                name="due_date"
                                label={{
                                    labelText: "invoice.due_date.label",
                                    mandatory: true,
                                }}
                                placeholder={t("invoice.due_date.placeholder")}
                                mode="single"
                            />
                            <SelectDropdown
                                name="invoice_type_id"
                                label={{
                                    labelText: "invoice.invoice_type.label",
                                    mandatory: true,
                                }}
                                placeholder="invoice.invoice_type.placeholder"
                                api="/dropdown-invoice-types"
                            />
                            <SelectDropdown
                                name="client_id"
                                label={{
                                    labelText: "invoice.client.label",
                                    mandatory: true,
                                }}
                                placeholder="invoice.client.placeholder"
                                api="/dropdown-clients"
                            />
                            <InputField
                                name="discount"
                                type="number"
                                label={{ labelText: "invoice.discount.label" }}
                                placeholder="invoice.discount.placeholder"
                            />
                            <SelectDropdown
                                name="status"
                                label={{ labelText: "invoice.status.label" }}
                                placeholder="invoice.status.placeholder"
                                options={statusOptions}
                            />
                            {status === "partial_paid" && (
                                <InputField
                                    name="partial_amount"
                                    type="number"
                                    label={{
                                        labelText: "invoice.partial_amount.label",
                                        mandatory: true,
                                    }}
                                    placeholder="invoice.partial_amount.placeholder"
                                />
                            )}
                            {(status === "paid" || status === "partial_paid") && (
                                <>
                                    <SelectDropdown
                                        name="fund_id"
                                        label={{
                                            labelText: "invoice.fund.label",
                                            mandatory: true,
                                        }}
                                        placeholder="invoice.fund.placeholder"
                                        api="/dropdown-funds"
                                    />
                                    <DatePicker
                                        name="payment_date"
                                        label={{ labelText: "invoice.payment_date.label" }}
                                        placeholder={t("invoice.payment_date.placeholder")}
                                        mode="single"
                                    />
                                </>
                            )}
                        </div>

                        <InvoiceLinesEditor />

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                            <div className="xl:col-span-2">
                                <RadioField
                                    name="confirmation_sms"
                                    label={{
                                        labelText: "invoice.confirmation_sms.label",
                                    }}
                                    direction="row"
                                    options={[
                                        { label: "common.yes", value: 1 },
                                        { label: "common.no", value: 0 },
                                    ]}
                                    defaultValue="0"
                                />
                                <div className="mt-4">
                                    <TextareaField
                                        name="note"
                                        label={{ labelText: "invoice.note.label" }}
                                        placeholder="invoice.note.placeholder"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <InvoiceTotals />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <ActionButton
                            action="cancel"
                            type="button"
                            size="default"
                            variant="outline"
                            title={t("common.cancel")}
                            onClick={() => router.push("/invoices")}
                            disabled={isPending}
                        />
                        <ActionButton
                            action="save"
                            type="submit"
                            size="default"
                            variant="default"
                            loading={isPending}
                            title={t("common.save")}
                        />
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default InvoiceForm;

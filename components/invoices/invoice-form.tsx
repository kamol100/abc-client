"use client";

import { FC, ReactNode, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import InvoiceLinesEditor from "@/components/invoices/invoice-lines-editor";
import InvoiceTotals from "@/components/invoices/invoice-totals";
import InvoiceFormFieldSchema from "./invoice-form-schema";
import { InvoiceFormSchema, InvoiceFormState } from "./invoice-type";

type InvoiceFormProps = {
    mode?: "create" | "edit";
    data?: Record<string, unknown>;
};

type ContentProps = {
    formSchema: FormFieldConfig[];
    renderField: (field: FormFieldConfig) => ReactNode;
    mode: string;
};

const defaultLine = {
    description: "",
    amount: 0,
    quantity: 1,
    discount: 0,
    order: 0,
    uuid: null,
};

const defaultValues: Record<string, unknown> = {
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

const InvoiceFormContent: FC<ContentProps> = ({
    formSchema,
    renderField,
    mode,
}) => {
    const { watch, setValue } = useFormContext<InvoiceFormState>();

    const status = watch("status");

    const fieldMap = useMemo(() => {
        const map = new Map<string, FormFieldConfig>();
        for (const f of formSchema) map.set(f.name, f);
        return map;
    }, [formSchema]);

    const field = (name: string) => {
        const config = fieldMap.get(name);
        return config ? renderField(config) : null;
    };

    // Set today's date on create mode after hydration to avoid SSR mismatch
    useEffect(() => {
        if (mode !== "create") return;
        const now = new Date();
        if (!watch("create_date")) setValue("create_date", now);
        if (!watch("due_date")) setValue("due_date", now);
    }, [mode, watch, setValue]);

    // Map API status "partial" → form status "partial_paid" on edit hydration
    useEffect(() => {
        const rawStatus = status as string;
        if (rawStatus === "partial") {
            setValue("status", "partial_paid", { shouldDirty: false });
        }
    }, [status, setValue]);

    return (
        <div className="space-y-4">
            <div className="rounded-md border p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {field("create_date")}
                    {field("due_date")}
                    {field("invoice_type_id")}
                    {field("client_id")}
                    {field("discount")}
                    {field("status")}
                    {status === "partial_paid" && field("partial_amount")}
                    {(status === "paid" || status === "partial_paid") && (
                        <>
                            {field("fund_id")}
                            {field("payment_date")}
                        </>
                    )}
                </div>

                <InvoiceLinesEditor />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2">
                        {field("confirmation_sms")}
                        <div className="mt-4">{field("note")}</div>
                    </div>
                    <InvoiceTotals />
                </div>
            </div>
        </div>
    );
};

const InvoiceForm: FC<InvoiceFormProps> = ({
    mode = "create",
    data,
}) => {
    const router = useRouter();
    const formSchema = InvoiceFormFieldSchema();
    const formData = mode === "edit" ? data : defaultValues;

    return (
        <div className="w-full xl:w-4/5 mx-auto flex flex-col flex-1 min-h-0">
            <FormBuilder
                formSchema={formSchema}
                grids={3}
                data={formData}
                api="/invoices"
                mode={mode}
                schema={InvoiceFormSchema}
                method="POST"
                queryKey="invoices"
                fullPage
                actionButtonClass="justify-end"
                onClose={() => router.push("/invoices")}
            >
                {(renderField) => (
                    <InvoiceFormContent
                        formSchema={formSchema}
                        renderField={renderField}
                        mode={mode}
                    />
                )}
            </FormBuilder>
        </div>
    );
};

export default InvoiceForm;

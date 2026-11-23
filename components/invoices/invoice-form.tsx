"use client";

import { FC, ReactNode, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import InvoiceLinesEditor from "@/components/invoices/invoice-lines-editor";
import InvoiceTotals from "@/components/invoices/invoice-totals";
import { cn } from "@/lib/utils";
import InvoiceFormFieldSchema from "@/components/invoices/invoice-form-schema";
import { paymentFundAccess, type PaymentFundAccess } from "@/components/invoices/payment-fund-access";
import { usePermissions, useProfile } from "@/context/app-provider";
import { InvoiceFormSchema, InvoiceFormState } from "@/components/invoices/invoice-type";

type InvoiceFormProps = {
    mode?: "create" | "edit";
    data?: Record<string, unknown>;
    /** Numeric client id. When set, the client dropdown is hidden and the form renders for a dialog. */
    clientId?: number;
    onClose?: () => void;
    onSuccess?: () => void;
};

type ContentProps = {
    formSchema: FormFieldConfig[];
    renderField: (field: FormFieldConfig) => ReactNode;
    mode: string;
    hideClient?: boolean;
    embedded?: boolean;
    fundAccess: PaymentFundAccess;
};

const defaultLine = {
    description: "",
    amount: 0,
    quantity: 1,
    discount: 0,
    order: 0,
    total_amount: 0,
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
    hideClient = false,
    embedded = false,
    fundAccess,
}) => {
    const { t } = useTranslation();
    const { watch, setValue } = useFormContext<InvoiceFormState>();

    const status = watch("status");
    const fundId = watch("fund_id");
    const paying = status === "paid" || status === "partial_paid";
    const { assignedFundId, lockFund, showUnassignedWarning } = fundAccess;

    // Paying a new invoice: start on the user's own fund; keep it there when locked.
    useEffect(() => {
        if (mode !== "create" || !paying || assignedFundId == null) return;
        if (lockFund ? fundId !== assignedFundId : !fundId) {
            setValue("fund_id", assignedFundId, { shouldDirty: false });
        }
    }, [mode, paying, assignedFundId, lockFund, fundId, setValue]);

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
            <div className={cn("space-y-4", !embedded && "rounded-md border p-4 sm:p-5")}>
                <div
                    className={cn(
                        "grid grid-cols-1 md:grid-cols-2 gap-4",
                        embedded ? "lg:grid-cols-3" : "xl:grid-cols-3",
                    )}
                >
                    {field("create_date")}
                    {field("due_date")}
                    {field("invoice_type_id")}
                    {!hideClient && field("client_id")}
                    {field("discount")}
                    {field("status")}
                    {status === "partial_paid" && field("partial_amount")}
                    {paying && (
                        <>
                            <div className="flex flex-col gap-2">
                                {field("fund_id")}
                                {showUnassignedWarning && (
                                    <p role="alert" className="text-sm text-destructive">
                                        {t("invoice.bulk_pay.fund.errors.unassigned")}
                                    </p>
                                )}
                            </div>
                            {field("payment_date")}
                        </>
                    )}
                </div>

                <InvoiceLinesEditor />

                <div className={cn("grid grid-cols-1 gap-4", embedded ? "lg:grid-cols-3" : "xl:grid-cols-3")}>
                    <div className={embedded ? "lg:col-span-2" : "xl:col-span-2"}>
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
    clientId,
    onClose,
    onSuccess,
}) => {
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const { profile } = useProfile();
    const fundAccess = paymentFundAccess({
        staff: profile.staff,
        canChangeFund: hasPermission("invoices.change-fund"),
        canUseBkashFund: hasPermission("invoices.bkash-fund-access"),
    });
    const formSchema = InvoiceFormFieldSchema({ fundLocked: fundAccess.lockFund });
    const embedded = clientId !== undefined;
    const formData = useMemo(() => {
        if (mode === "edit") return data;
        return embedded ? { ...defaultValues, client_id: clientId } : defaultValues;
    }, [mode, data, embedded, clientId]);

    if (embedded) {
        return (
            <FormBuilder
                formSchema={formSchema}
                grids={3}
                data={formData}
                api="/invoices"
                mode={mode}
                schema={InvoiceFormSchema}
                method="POST"
                queryKey="invoices"
                actionButtonClass="justify-end"
                onClose={onClose}
                onSuccess={onSuccess}
            >
                {(renderField) => (
                    <InvoiceFormContent
                        formSchema={formSchema}
                        renderField={renderField}
                        mode={mode}
                        hideClient
                        embedded
                        fundAccess={fundAccess}
                    />
                )}
            </FormBuilder>
        );
    }

    return (
        <div className="w-full xl:w-4/5 mx-auto flex flex-col flex-1 min-h-0">
            <div className="mr-3">
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
                            fundAccess={fundAccess}
                        />
                    )}
                </FormBuilder>
            </div>
        </div>
    );
};

export default InvoiceForm;

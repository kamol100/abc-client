"use client";

import { useRouter } from "next/navigation";
import { FC, ReactNode, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormBuilder from "../form-wrapper/form-builder";
import { FormFieldConfig } from "../form-wrapper/form-builder-type";
import PaymentFormFieldSchema from "./payment-form-schema";
import { PaymentFormSchema } from "./payment-type";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Record<string, unknown>;
};

type ContentProps = {
    formSchema: FormFieldConfig[];
    renderField: (field: FormFieldConfig) => ReactNode;
};

const PaymentFormContent: FC<ContentProps> = ({ formSchema, renderField }) => {
    const { t } = useTranslation();
    const { watch } = useFormContext();
    const status: string = watch("status") ?? "paid";

    const fieldMap = useMemo(() => {
        const map = new Map<string, FormFieldConfig>();
        for (const f of formSchema) map.set(f.name, f);
        return map;
    }, [formSchema]);

    const field = (name: string) => {
        const config = fieldMap.get(name);
        return config ? renderField(config) : null;
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("title")}
                {field("amount")}
                {field("client_id")}
                {field("fund_id")}
                {field("payment_date")}
                {field("status")}
                {field("discount")}
                {field("transaction_id")}
                {status === "partial_paid" && field("partial_amount")}
                {field("confirmation_sms")}
            </div>
            <div>{field("note")}</div>
        </div>
    );
};

const PaymentForm: FC<Props> = ({
    mode = "create",
    api = "/payments",
    method = "POST",
    data,
}) => {
    const router = useRouter();
    const formSchema = PaymentFormFieldSchema(mode);

    return (
        <div className="w-full md:w-3/4 mx-auto flex flex-col flex-1 min-h-0">
            <FormBuilder
                formSchema={formSchema}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={PaymentFormSchema}
                method={method}
                queryKey="payments"
                fullPage
                actionButtonClass="justify-center"
                onClose={() => router.push("/payments")}
            >
                {(renderField) => (
                    <PaymentFormContent
                        formSchema={formSchema}
                        renderField={renderField}
                    />
                )}
            </FormBuilder>
        </div>
    );
};

export default PaymentForm;

"use client";

import { FC, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import ProductOutLinesEditor from "@/components/products/product-out-lines-editor";
import ProductOutFormFieldSchema from "@/components/products/product-out-form-schema";
import {
    ProductOutFormSchema,
    ProductOutFormState,
} from "@/components/products/product-out-type";
import { formatMoney, toNumber } from "@/lib/helper/helper";

type ProductOutFormProps = {
    mode?: "create" | "edit";
    data?: Record<string, unknown>;
};

type ProductOutContentProps = {
    formSchema: FormFieldConfig[];
    renderField: (field: FormFieldConfig) => ReactNode;
};

const defaultValues: ProductOutFormState = {
    out_date: undefined,
    received_by: 0,
    client_id: null,
    create_invoice: 0,
    note: "",
    product: [
        {
            product_id: 0,
            productin_id: null,
            product_category_id: 1,
            quantity: 1,
            unit_price: 0,
            vat: 0,
            discount: 0,
            total_price: 0,
            has_serial: 0,
            serial: [],
            fiberID: null,
            fiber_meter_start: null,
            fiber_meter_end: null,
        },
    ],
};

const ProductOutTotals: FC = () => {
    const { t } = useTranslation();
    const { control } = useFormContext<ProductOutFormState>();
    const lines = useWatch({
        control,
        name: "product",
    }) ?? [];

    const totals = useMemo(() => {
        const quantity = lines.reduce((sum, line) => sum + toNumber(line.quantity), 0);
        const discount = lines.reduce((sum, line) => sum + toNumber(line.discount), 0);
        const total = lines.reduce((sum, line) => sum + toNumber(line.total_price), 0);
        return {
            quantity,
            discount,
            total,
            subTotal: total + discount,
        };
    }, [lines]);

    return (
        <div className="rounded-md border p-4 space-y-2 bg-muted/20">
            <p className="text-sm font-semibold">{t("product_out.totals.title")}</p>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    {t("product_out.totals.total_quantity")}
                </span>
                <span className="font-semibold">{formatMoney(totals.quantity)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    {t("product_out.totals.sub_total")}
                </span>
                <span className="font-semibold">৳{formatMoney(totals.subTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    {t("product_out.totals.discount")}
                </span>
                <span className="font-semibold">৳{formatMoney(totals.discount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-2">
                <span className="font-medium">{t("product_out.totals.total_amount")}</span>
                <span className="font-semibold">৳{formatMoney(totals.total)}</span>
            </div>
        </div>
    );
};

const ProductOutFormContent: FC<ProductOutContentProps> = ({
    formSchema,
    renderField,
}) => {
    const fieldMap = useMemo(() => {
        const map = new Map<string, FormFieldConfig>();
        for (const field of formSchema) map.set(field.name, field);
        return map;
    }, [formSchema]);

    const field = (name: string) => {
        const config = fieldMap.get(name);
        return config ? renderField(config) : null;
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {field("out_date")}
                    {field("received_by")}
                    {field("client_id")}
                </div>
                <div>{field("create_invoice")}</div>

                <ProductOutLinesEditor />
                <ProductOutTotals />
                <div>{field("note")}</div>
            </div>
        </div>
    );
};

const ProductOutForm: FC<ProductOutFormProps> = ({ mode = "create", data }) => {
    const router = useRouter();
    const formSchema = ProductOutFormFieldSchema();
    const formData = mode === "edit" && data ? data : defaultValues;

    return (
        <div className="w-full xl:w-5/6 mx-auto flex flex-col flex-1 min-h-0">
            <FormBuilder
                formSchema={formSchema}
                grids={3}
                data={formData}
                api="/products-out"
                mode={mode}
                schema={ProductOutFormSchema}
                method="POST"
                queryKey="products,products-out"
                fullPage
                actionButtonClass="justify-end"
                onClose={() => router.push("/products")}
            >
                {(renderField) => (
                    <ProductOutFormContent
                        formSchema={formSchema}
                        renderField={renderField}
                    />
                )}
            </FormBuilder>
        </div>
    );
};

export default ProductOutForm;

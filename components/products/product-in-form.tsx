"use client";

import { FC, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import ProductInLinesEditor from "@/components/products/product-in-lines-editor";
import ProductInFormFieldSchema from "@/components/products/product-in-form-schema";
import {
    ProductInFormSchema,
    ProductInFormState,
} from "@/components/products/product-in-type";
import { formatMoney, toNumber } from "@/lib/helper/helper";

type ProductInFormProps = {
    mode?: "create" | "edit";
    data?: Record<string, unknown>;
};

type ProductInContentProps = {
    formSchema: FormFieldConfig[];
    renderField: (field: FormFieldConfig) => ReactNode;
};

const defaultValues: ProductInFormState = {
    purchase_by: 0,
    purchase_date: undefined,
    voucher: "",
    note: "",
    expense: {
        expense_type_id: null,
        vendor_id: null,
        fund_id: null,
        amount: 0,
        note: "",
    },
    product: [
        {
            product_id: 0,
            product_category_id: 1,
            brand: null,
            status: "new",
            quantity: 0,
            unit_price: 0,
            unit_sell_price: 0,
            vat: 0,
            total_price: 0,
            has_serial: 0,
            serial: [],
            fiberID: null,
            fiber_meter_start: null,
            fiber_meter_end: null,
        },
    ],
};

const ProductInTotals: FC = () => {
    const { t } = useTranslation();
    const { control } = useFormContext<ProductInFormState>();
    const lines = useWatch({
        control,
        name: "product",
    }) ?? [];

    const totals = useMemo(() => {
        const totalQuantity = lines.reduce(
            (sum, line) => sum + toNumber(line.quantity),
            0,
        );
        const totalAmount = lines.reduce(
            (sum, line) => sum + toNumber(line.total_price),
            0,
        );
        return { totalQuantity, totalAmount };
    }, [lines]);

    return (
        <div className="rounded-md border p-4 space-y-2 bg-muted/20">
            <p className="text-sm font-semibold">{t("product_in.totals.title")}</p>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    {t("product_in.totals.total_quantity")}
                </span>
                <span className="font-semibold">{formatMoney(totals.totalQuantity)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    {t("product_in.totals.total_amount")}
                </span>
                <span className="font-semibold">৳{formatMoney(totals.totalAmount)}</span>
            </div>
        </div>
    );
};

const ProductInFormContent: FC<ProductInContentProps> = ({
    formSchema,
    renderField,
}) => {
    const { t } = useTranslation();

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
                    {field("purchase_by")}
                    {field("purchase_date")}
                    {field("voucher")}
                </div>
                <div>{field("note")}</div>

                <div className="rounded-md border border-dashed p-4 space-y-4">
                    <p className="text-sm font-semibold">{t("product_in.expense.title")}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {field("expense.expense_type_id")}
                        {field("expense.vendor_id")}
                        {field("expense.fund_id")}
                        {field("expense.amount")}
                    </div>
                    <div>{field("expense.note")}</div>
                </div>

                <ProductInLinesEditor />
                <ProductInTotals />
            </div>
        </div>
    );
};

const ProductInForm: FC<ProductInFormProps> = ({ mode = "create", data }) => {
    const router = useRouter();
    const formSchema = ProductInFormFieldSchema();
    const formData = mode === "edit" && data ? data : defaultValues;

    return (
        <div className="w-full xl:w-5/6 mx-auto flex flex-col flex-1 min-h-0">
            <FormBuilder
                formSchema={formSchema}
                grids={3}
                data={formData}
                api="/products-in"
                mode={mode}
                schema={ProductInFormSchema}
                method="POST"
                queryKey="products,products-in"
                fullPage
                actionButtonClass="justify-end"
                onClose={() => router.push("/products")}
            >
                {(renderField) => (
                    <ProductInFormContent
                        formSchema={formSchema}
                        renderField={renderField}
                    />
                )}
            </FormBuilder>
        </div>
    );
};

export default ProductInForm;

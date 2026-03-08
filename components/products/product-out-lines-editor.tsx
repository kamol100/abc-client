"use client";

import { FC, useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useFetch } from "@/app/actions";
import ActionButton from "@/components/action-button";
import InputField from "@/components/form/input-field";
import SelectDropdown from "@/components/select-dropdown";
import ProductOutSerialPicker from "@/components/products/product-out-serial-picker";
import {
    ProductOutFormState,
    calculateProductOutLineTotal,
} from "@/components/products/product-out-type";
import { formatMoney, toNumber } from "@/lib/helper/helper";

type ProductDetail = {
    has_serial?: number | string | null;
    vat?: number | string | null;
    product_category_id?: number | string | null;
};

const defaultLine: ProductOutFormState["product"][number] = {
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
};

const isNearlyEqual = (left: number, right: number): boolean => {
    return Math.abs(left - right) < 0.0001;
};

const getDetailFromResponse = (response: unknown): ProductDetail | null => {
    if (!response || typeof response !== "object") return null;
    const root = response as Record<string, unknown>;
    const data = root.data;

    if (data && typeof data === "object") {
        const nested = (data as Record<string, unknown>).data;
        if (nested && typeof nested === "object") {
            return nested as ProductDetail;
        }
        return data as ProductDetail;
    }
    return null;
};

type ProductOutLineItemProps = {
    index: number;
    canRemove: boolean;
    onRemove: (index: number) => void;
};

const ProductOutLineItem: FC<ProductOutLineItemProps> = ({
    index,
    canRemove,
    onRemove,
}) => {
    const { t } = useTranslation();
    const { control, setValue } = useFormContext<ProductOutFormState>();

    const line = useWatch({
        control,
        name: `product.${index}`,
    });

    const productId = toNumber(line?.product_id);
    const productInId = toNumber(line?.productin_id);
    const hasSerial = toNumber(line?.has_serial) === 1;
    const total = toNumber(line?.total_price);

    const { data: productDetailResponse } = useQuery({
        queryKey: ["product-out-line-detail", productId],
        queryFn: async () => {
            const response = await useFetch({
                url: `/products/${productId}`,
            });
            return getDetailFromResponse(response);
        },
        enabled: productId > 0,
        retry: 0,
    });

    useEffect(() => {
        if (!productDetailResponse) return;
        const hasSerialValue = Math.min(
            1,
            Math.max(0, toNumber(productDetailResponse.has_serial)),
        );
        const vatValue = Math.max(0, toNumber(productDetailResponse.vat));
        const categoryValue = toNumber(productDetailResponse.product_category_id) || 1;

        if (toNumber(line?.has_serial) !== hasSerialValue) {
            setValue(`product.${index}.has_serial`, hasSerialValue, {
                shouldDirty: true,
                shouldValidate: false,
            });
        }
        if (!isNearlyEqual(toNumber(line?.vat), vatValue)) {
            setValue(`product.${index}.vat`, vatValue, {
                shouldDirty: true,
                shouldValidate: false,
            });
        }
        if (toNumber(line?.product_category_id) !== categoryValue) {
            setValue(`product.${index}.product_category_id`, categoryValue, {
                shouldDirty: true,
                shouldValidate: false,
            });
        }
    }, [index, line?.has_serial, line?.product_category_id, line?.vat, productDetailResponse, setValue]);

    return (
        <div className="rounded-md border p-3 space-y-3">
            <div className="mb-1 flex items-center justify-between md:hidden">
                <p className="text-xs font-medium text-muted-foreground">
                    {t("product_out.lines.item", { index: index + 1 })}
                </p>
                <ActionButton
                    action="delete"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(index)}
                    disabled={!canRemove}
                    title={t("product_out.lines.remove")}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <SelectDropdown
                    name={`product.${index}.product_id`}
                    api="/dropdown-products?filter=out"
                    isClearable={false}
                    label={{
                        labelText: "product_out.line.product.label",
                        mandatory: true,
                    }}
                    placeholder="product_out.line.product.placeholder"
                    onValueChange={() => {
                        setValue(`product.${index}.productin_id`, null, {
                            shouldDirty: true,
                            shouldValidate: false,
                        });
                        setValue(`product.${index}.serial`, [], {
                            shouldDirty: true,
                            shouldValidate: false,
                        });
                    }}
                />
                <SelectDropdown
                    name={`product.${index}.productin_id`}
                    api={productId > 0 ? `/dropdown-product-ins/${productId}` : undefined}
                    isDisabled={productId <= 0}
                    label={{ labelText: "product_out.line.product_in.label" }}
                    placeholder="product_out.line.product_in.placeholder"
                    onValueChange={() => {
                        setValue(`product.${index}.serial`, [], {
                            shouldDirty: true,
                            shouldValidate: false,
                        });
                    }}
                />
                <InputField
                    type="number"
                    name={`product.${index}.quantity`}
                    label={{
                        labelText: "product_out.line.quantity.label",
                        mandatory: true,
                    }}
                    placeholder="product_out.line.quantity.placeholder"
                />
                <InputField
                    type="number"
                    name={`product.${index}.unit_price`}
                    label={{
                        labelText: "product_out.line.unit_price.label",
                        mandatory: true,
                    }}
                    placeholder="product_out.line.unit_price.placeholder"
                />
                <InputField
                    type="number"
                    name={`product.${index}.vat`}
                    label={{ labelText: "product_out.line.vat.label" }}
                    placeholder="product_out.line.vat.placeholder"
                />
                <InputField
                    type="number"
                    name={`product.${index}.discount`}
                    label={{ labelText: "product_out.line.discount.label" }}
                    placeholder="product_out.line.discount.placeholder"
                />
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{t("product_out.line.total.label")}</p>
                    <div className="flex h-10 items-center justify-end rounded-md border bg-muted/40 px-3 text-sm font-semibold">
                        ৳{formatMoney(total)}
                    </div>
                </div>
            </div>

            {hasSerial && productInId > 0 && <ProductOutSerialPicker lineIndex={index} />}

            <div className="hidden md:flex justify-end">
                <ActionButton
                    action="delete"
                    variant="outline"
                    size="icon"
                    onClick={() => onRemove(index)}
                    disabled={!canRemove}
                    aria-label={t("product_out.lines.remove")}
                />
            </div>
        </div>
    );
};

const ProductOutLinesEditor: FC = () => {
    const { t } = useTranslation();
    const { control, setValue } = useFormContext<ProductOutFormState>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "product",
    });

    const lines = useWatch({
        control,
        name: "product",
    }) ?? [];

    useEffect(() => {
        lines.forEach((line, index) => {
            const quantity = Math.max(0, toNumber(line?.quantity));
            const lineTotal = calculateProductOutLineTotal(
                quantity,
                line?.unit_price,
                line?.vat,
                line?.discount,
            );

            if (!isNearlyEqual(toNumber(line?.total_price), lineTotal)) {
                setValue(`product.${index}.total_price`, lineTotal, {
                    shouldDirty: true,
                    shouldValidate: false,
                });
            }

            const hasSerial = toNumber(line?.has_serial) === 1;
            const serials = Array.isArray(line?.serial)
                ? line.serial.map((id) => toNumber(id))
                : [];
            const maxAllowed = Math.max(0, Math.trunc(quantity));

            if (!hasSerial && serials.length > 0) {
                setValue(`product.${index}.serial`, [], {
                    shouldDirty: true,
                    shouldValidate: false,
                });
                return;
            }

            if (hasSerial && serials.length > maxAllowed) {
                setValue(`product.${index}.serial`, serials.slice(0, maxAllowed), {
                    shouldDirty: true,
                    shouldValidate: false,
                });
            }
        });
    }, [lines, setValue]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("product_out.lines.title")}</h3>
                <ActionButton
                    action="add"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ...defaultLine })}
                    title={t("product_out.lines.add")}
                />
            </div>

            <div className="hidden xl:grid grid-cols-7 gap-3 rounded-md border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>{t("product_out.line.product.label")}</span>
                <span>{t("product_out.line.product_in.label")}</span>
                <span>{t("product_out.line.quantity.label")}</span>
                <span>{t("product_out.line.unit_price.label")}</span>
                <span>{t("product_out.line.vat.label")}</span>
                <span>{t("product_out.line.discount.label")}</span>
                <span className="text-right">{t("product_out.line.total.label")}</span>
            </div>

            {fields.map((field, index) => (
                <ProductOutLineItem
                    key={field.id}
                    index={index}
                    canRemove={fields.length > 1}
                    onRemove={remove}
                />
            ))}
        </div>
    );
};

export default ProductOutLinesEditor;

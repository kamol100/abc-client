"use client";

import { FC, useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useFetch } from "@/app/actions";
import MyButton from "@/components/my-button";
import InputField from "@/components/form/input-field";
import SelectDropdown from "@/components/select-dropdown";
import ProductOutSerialPicker from "@/components/products/product-out-serial-picker";
import {
    ProductOutFormState,
    calculateProductOutLineTotal,
} from "@/components/products/product-out-type";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { ProductCategoryRow } from "@/components/product-category/product-category-type";
import DisplayCount from "../display-count";

type ProductDetail = {
    has_serial?: number | string | null;
    vat?: number | string | null;
    category?: ProductCategoryRow | null;
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

const lineDesktopGridTemplate =
    "md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.35fr)_minmax(0,0.5fr)_minmax(0,0.75fr)_minmax(0,0.5fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_auto]";

const lineDesktopMinWidth = "md:min-w-[960px]";

const lineDesktopGridClassName = `grid grid-cols-1 gap-3 ${lineDesktopGridTemplate} ${lineDesktopMinWidth}`;


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

    const { data: productResponse } = useApiQuery<ApiResponse<ProductDetail>>({
        queryKey: ["product-line-detail", productId],
        url: `get-product/${productId}`,
        pagination: false,
        enabled: productId > 0,
        retry: 0,
    });

    const productDetail = productResponse?.data ?? null;

    useEffect(() => {
        if (!productDetail) return;
        const hasSerialValue = Math.min(
            1,
            Math.max(0, toNumber(productDetail.has_serial)),
        );
        const vatValue = Math.max(0, toNumber(productDetail.vat));
        const categoryValue = toNumber(productDetail?.category?.id) || 1;
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
    }, [index, line?.has_serial, line?.product_category_id, line?.vat, productDetail, setValue]);
    return (
        <div className="rounded-md border p-3 space-y-3">
            <div className="mb-1 flex items-center justify-between md:hidden">
                <p className="text-xs font-medium text-muted-foreground">
                    {t("product_out.lines.item", { index: index + 1 })}
                </p>
                <MyButton
                    action="delete"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(index)}
                    disabled={!canRemove}
                    title={t("product_out.lines.remove")}
                />
            </div>

            <div className="md:overflow-x-auto pl-0.5">
                <div className={lineDesktopGridClassName}>
                    <div className="min-w-0">
                        <SelectDropdown
                            name={`product.${index}.product_id`}
                            api="/dropdown-products"
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
                    </div>
                    <div className="min-w-0">
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
                    </div>
                    <div className="min-w-0">
                        <InputField
                            type="number"
                            name={`product.${index}.quantity`}
                            label={{
                                labelText: "product_out.line.quantity.label",
                                mandatory: true,
                            }}
                            placeholder="product_out.line.quantity.placeholder"
                        />
                    </div>
                    <div className="min-w-0">
                        <InputField
                            type="number"
                            name={`product.${index}.unit_price`}
                            label={{
                                labelText: "product_out.line.unit_price.label",
                                mandatory: true,
                            }}
                            placeholder="product_out.line.unit_price.placeholder"
                        />
                    </div>
                    <div className="min-w-0">
                        <InputField
                            type="number"
                            name={`product.${index}.vat`}
                            label={{ labelText: "product_out.line.vat.label" }}
                            placeholder="product_out.line.vat.placeholder"
                        />
                    </div>
                    <div className="min-w-0">
                        <InputField
                            reserveErrorSpace
                            type="number"
                            name={`product.${index}.discount`}
                            label={{ labelText: "product_out.line.discount.label" }}
                            placeholder="product_out.line.discount.placeholder"
                        />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                        <p className="text-sm font-medium">{t("product_out.line.total.label")}</p>
                        <div className="flex h-9 mt-1 items-center justify-end rounded-md border bg-muted/40 px-3 text-sm font-semibold">
                            <DisplayCount amount={toNumber(total)} formatCurrency />
                        </div>
                    </div>
                    <div className="hidden md:flex items-start justify-end pt-7">
                        <MyButton
                            action="delete"
                            variant="outline"
                            size="icon"
                            onClick={() => onRemove(index)}
                            disabled={!canRemove}
                            aria-label={t("product_out.lines.remove")}
                        />
                    </div>
                </div>
            </div>

            {hasSerial && productInId > 0 && <ProductOutSerialPicker lineIndex={index} />}

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
            const serialValues = Array.isArray(line?.serial) ? line.serial : [];
            const maxAllowed = Math.max(0, Math.trunc(quantity));

            if (!hasSerial && serialValues.length > 0) {
                setValue(`product.${index}.serial`, [], {
                    shouldDirty: true,
                    shouldValidate: false,
                });
                return;
            }

            if (hasSerial && serialValues.length > maxAllowed) {
                setValue(`product.${index}.serial`, serialValues.slice(0, maxAllowed), {
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
                <MyButton
                    action="add"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ...defaultLine })}
                    title={t("product_out.lines.add")}
                />
            </div>

            {/* <div className="hidden md:block overflow-x-auto">
                <div
                    className={`${lineDesktopGridClassName} rounded-md border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground`}
                >
                    <span>{t("product_out.line.product.label")}</span>
                    <span>{t("product_out.line.product_in.label")}</span>
                    <span>{t("product_out.line.quantity.label")}</span>
                    <span>{t("product_out.line.unit_price.label")}</span>
                    <span>{t("product_out.line.vat.label")}</span>
                    <span>{t("product_out.line.discount.label")}</span>
                    <span className="text-right">{t("product_out.line.total.label")}</span>
                    <span className="text-right">{t("product_out.lines.remove")}</span>
                </div>
            </div> */}

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

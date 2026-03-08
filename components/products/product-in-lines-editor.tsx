"use client";

import { FC, useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useFetch } from "@/app/actions";
import ActionButton from "@/components/action-button";
import InputField from "@/components/form/input-field";
import SelectDropdown from "@/components/select-dropdown";
import {
    ProductInFormState,
    calculateProductInLineTotal,
} from "@/components/products/product-in-type";
import { formatMoney, toNumber } from "@/lib/helper/helper";

type ProductDetail = {
    has_serial?: number | string | null;
    vat?: number | string | null;
    product_category_id?: number | string | null;
};

const defaultLine: ProductInFormState["product"][number] = {
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

type ProductInLineItemProps = {
    index: number;
    fieldId: string;
    canRemove: boolean;
    onRemove: (index: number) => void;
};

const ProductInLineItem: FC<ProductInLineItemProps> = ({
    index,
    fieldId,
    canRemove,
    onRemove,
}) => {
    const { t } = useTranslation();
    const { setValue, control } = useFormContext<ProductInFormState>();

    const line = useWatch({
        control,
        name: `product.${index}`,
    });

    const productId = toNumber(line?.product_id);
    const hasSerial = toNumber(line?.has_serial) === 1;
    const isFiber = toNumber(line?.product_category_id) === 2;
    const total = toNumber(line?.total_price);

    const { data: productDetailResponse } = useQuery({
        queryKey: ["product-line-detail", productId],
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
                    {t("product_in.lines.item", { index: index + 1 })}
                </p>
                <ActionButton
                    action="delete"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(index)}
                    disabled={!canRemove}
                    title={t("product_in.lines.remove")}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <SelectDropdown
                    name={`product.${index}.product_id`}
                    api="/dropdown-products"
                    isClearable={false}
                    label={{
                        labelText: "product_in.line.product.label",
                        mandatory: true,
                    }}
                    placeholder="product_in.line.product.placeholder"
                    onValueChange={() => {
                        setValue(`product.${index}.serial`, [], {
                            shouldDirty: true,
                            shouldValidate: false,
                        });
                    }}
                />
                <InputField
                    name={`product.${index}.brand`}
                    label={{ labelText: "product_in.line.brand.label" }}
                    placeholder="product_in.line.brand.placeholder"
                />
                <SelectDropdown
                    name={`product.${index}.status`}
                    isClearable={false}
                    options={[
                        { value: "new", label: "product_in.status.new" },
                        { value: "old", label: "product_in.status.old" },
                        { value: "replace", label: "product_in.status.replace" },
                    ]}
                    label={{ labelText: "product_in.line.status.label" }}
                    placeholder="product_in.line.status.placeholder"
                />
                <InputField
                    type="number"
                    name={`product.${index}.quantity`}
                    label={{
                        labelText: "product_in.line.quantity.label",
                        mandatory: true,
                    }}
                    placeholder="product_in.line.quantity.placeholder"
                />
                <InputField
                    type="number"
                    name={`product.${index}.unit_price`}
                    label={{
                        labelText: "product_in.line.unit_price.label",
                        mandatory: true,
                    }}
                    placeholder="product_in.line.unit_price.placeholder"
                />
                <InputField
                    type="number"
                    name={`product.${index}.unit_sell_price`}
                    label={{ labelText: "product_in.line.unit_sell_price.label" }}
                    placeholder="product_in.line.unit_sell_price.placeholder"
                />
                <InputField
                    type="number"
                    name={`product.${index}.vat`}
                    label={{ labelText: "product_in.line.vat.label" }}
                    placeholder="product_in.line.vat.placeholder"
                />
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{t("product_in.line.total.label")}</p>
                    <div className="flex h-10 items-center justify-end rounded-md border bg-muted/40 px-3 text-sm font-semibold">
                        ৳{formatMoney(total)}
                    </div>
                </div>
            </div>

            {isFiber && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-md border border-dashed p-3">
                    <InputField
                        name={`product.${index}.fiberID`}
                        label={{ labelText: "product_in.line.fiber.fiber_id.label" }}
                        placeholder="product_in.line.fiber.fiber_id.placeholder"
                    />
                    <InputField
                        type="number"
                        name={`product.${index}.fiber_meter_start`}
                        label={{ labelText: "product_in.line.fiber.meter_start.label" }}
                        placeholder="product_in.line.fiber.meter_start.placeholder"
                    />
                    <InputField
                        type="number"
                        name={`product.${index}.fiber_meter_end`}
                        label={{ labelText: "product_in.line.fiber.meter_end.label" }}
                        placeholder="product_in.line.fiber.meter_end.placeholder"
                    />
                </div>
            )}

            {hasSerial && (
                <div className="rounded-md border border-dashed p-3">
                    <p className="mb-3 text-sm font-medium">
                        {t("product_in.line.serial.title")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        {Array.from({
                            length: Math.max(0, Math.trunc(toNumber(line?.quantity))),
                        }).map((_, serialIndex) => (
                            <InputField
                                key={`${fieldId}-${serialIndex}`}
                                name={`product.${index}.serial.${serialIndex}`}
                                label={{
                                    labelText: t("product_in.line.serial.label", {
                                        index: serialIndex + 1,
                                    }),
                                }}
                                placeholder={t("product_in.line.serial.placeholder", {
                                    index: serialIndex + 1,
                                })}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="hidden md:flex justify-end">
                <ActionButton
                    action="delete"
                    variant="outline"
                    size="icon"
                    onClick={() => onRemove(index)}
                    disabled={!canRemove}
                    aria-label={t("product_in.lines.remove")}
                />
            </div>
        </div>
    );
};

const ProductInLinesEditor: FC = () => {
    const { t } = useTranslation();
    const { control, setValue, getValues } = useFormContext<ProductInFormState>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "product",
    });

    const lines = useWatch({
        control,
        name: "product",
    }) ?? [];

    useEffect(() => {
        let totalAmount = 0;

        lines.forEach((line, index) => {
            const isFiberCategory = toNumber(line?.product_category_id) === 2;
            const meterStart = toNumber(line?.fiber_meter_start);
            const meterEnd = toNumber(line?.fiber_meter_end);
            const fallbackQuantity = Math.max(0, toNumber(line?.quantity));
            const derivedQuantity = isFiberCategory
                ? Math.max(0, meterEnd - meterStart)
                : fallbackQuantity;

            if (isFiberCategory && !isNearlyEqual(fallbackQuantity, derivedQuantity)) {
                setValue(`product.${index}.quantity`, derivedQuantity, {
                    shouldDirty: true,
                    shouldValidate: false,
                });
            }

            const computedLineTotal = Math.max(
                0,
                calculateProductInLineTotal(derivedQuantity, line?.unit_price, line?.vat),
            );
            totalAmount += computedLineTotal;

            if (!isNearlyEqual(toNumber(line?.total_price), computedLineTotal)) {
                setValue(`product.${index}.total_price`, computedLineTotal, {
                    shouldDirty: true,
                    shouldValidate: false,
                });
            }

            const hasSerial = toNumber(line?.has_serial) === 1;
            const currentSerials = Array.isArray(line?.serial)
                ? line.serial.map((item) => item ?? "")
                : [];
            const expectedSerialCount = Math.max(0, Math.trunc(derivedQuantity));

            if (hasSerial) {
                const nextSerials = Array.from(
                    { length: expectedSerialCount },
                    (_, serialIndex) => currentSerials[serialIndex] ?? "",
                );
                const changed =
                    nextSerials.length !== currentSerials.length ||
                    nextSerials.some((value, serialIndex) => value !== currentSerials[serialIndex]);

                if (changed) {
                    setValue(`product.${index}.serial`, nextSerials, {
                        shouldDirty: true,
                        shouldValidate: false,
                    });
                }
            } else if (currentSerials.length > 0) {
                setValue(`product.${index}.serial`, [], {
                    shouldDirty: true,
                    shouldValidate: false,
                });
            }
        });

        const currentExpenseAmount = toNumber(getValues("expense.amount"));
        if (!isNearlyEqual(currentExpenseAmount, totalAmount)) {
            setValue("expense.amount", totalAmount, {
                shouldDirty: true,
                shouldValidate: false,
            });
        }
    }, [getValues, lines, setValue]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("product_in.lines.title")}</h3>
                <ActionButton
                    action="add"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ...defaultLine })}
                    title={t("product_in.lines.add")}
                />
            </div>

            <div className="hidden xl:grid grid-cols-8 gap-3 rounded-md border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span>{t("product_in.line.product.label")}</span>
                <span>{t("product_in.line.brand.label")}</span>
                <span>{t("product_in.line.status.label")}</span>
                <span>{t("product_in.line.quantity.label")}</span>
                <span>{t("product_in.line.unit_price.label")}</span>
                <span>{t("product_in.line.unit_sell_price.label")}</span>
                <span>{t("product_in.line.vat.label")}</span>
                <span className="text-right">{t("product_in.line.total.label")}</span>
            </div>

            {fields.map((field, index) => (
                <ProductInLineItem
                    key={field.id}
                    fieldId={field.id}
                    index={index}
                    canRemove={fields.length > 1}
                    onRemove={remove}
                />
            ))}
        </div>
    );
};

export default ProductInLinesEditor;

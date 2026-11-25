"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ProductCategoryRow } from "@/components/product-category/product-category-type";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { toNumber } from "@/lib/helper/helper";

type ProductDetail = {
    has_serial?: number | string | null;
    vat?: number | string | null;
    category?: ProductCategoryRow | null;
};

type ProductLine = {
    product_id?: unknown;
    has_serial?: unknown;
    vat?: unknown;
    product_category_id?: unknown;
};

const asNumber = (value: unknown): number => toNumber(value as number | string | null | undefined);

const isNearlyEqual = (left: number, right: number): boolean => Math.abs(left - right) < 0.0001;

/**
 * For one stock line: loads the chosen product and copies what the line needs from
 * it into the row, namely whether it has serial numbers, its VAT, and its category.
 *
 * `rowPath` is the form path of the line (`product.2`); `line` is its current values.
 */
export function useProductLineDetail(rowPath: string, line: ProductLine | undefined) {
    const { setValue } = useFormContext();
    const productId = asNumber(line?.product_id);

    const { data: productResponse } = useApiQuery<ApiResponse<ProductDetail>>({
        queryKey: ["product-line-detail", productId],
        url: `get-product/${productId}`,
        pagination: false,
        enabled: productId > 0,
        retry: 0,
    });

    const productDetail = productResponse?.data ?? null;
    const lineHasSerial = line?.has_serial;
    const lineVat = line?.vat;
    const lineCategory = line?.product_category_id;

    useEffect(() => {
        if (!productDetail) return;
        const hasSerialValue = Math.min(1, Math.max(0, asNumber(productDetail.has_serial)));
        const vatValue = Math.max(0, asNumber(productDetail.vat));
        const categoryValue = asNumber(productDetail?.category?.id) || 1;
        const options = { shouldDirty: true, shouldValidate: false };

        if (asNumber(lineHasSerial) !== hasSerialValue) {
            setValue(`${rowPath}.has_serial`, hasSerialValue, options);
        }
        if (!isNearlyEqual(asNumber(lineVat), vatValue)) {
            setValue(`${rowPath}.vat`, vatValue, options);
        }
        if (asNumber(lineCategory) !== categoryValue) {
            setValue(`${rowPath}.product_category_id`, categoryValue, options);
        }
    }, [rowPath, lineHasSerial, lineCategory, lineVat, productDetail, setValue]);
}

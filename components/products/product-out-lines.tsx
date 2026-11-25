"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import type {
    FieldArrayConfig,
    FieldArrayRenderProps,
    FieldArrayRow,
} from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
import ProductOutSerialPicker from "@/components/products/product-out-serial-picker";
import { calculateProductOutLineTotal } from "@/components/products/product-out-type";
import { useProductLineDetail } from "@/components/products/use-product-line-detail";
import { toNumber } from "@/lib/helper/helper";

const asNumber = (value: unknown): number => toNumber(value as number | string | null | undefined);

/** A new stock-out line, before the user fills it in. */
export const defaultProductOutLine = {
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

const lineGridClassName =
    "grid grid-cols-1 gap-3 " +
    "md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.35fr)_minmax(0,0.5fr)_minmax(0,0.75fr)_minmax(0,0.5fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_auto] " +
    "md:min-w-[960px]";

/** The line total, shown as money in a box that lines up with the inputs. */
function LineTotal({ value }: { value: number | string | null }) {
    const { t } = useTranslation();
    return (
        <>
            <p className="text-sm font-medium">{t("product_out.line.total.label")}</p>
            <div className="flex h-9 mt-1 items-center justify-end rounded-md border bg-muted/40 px-3 text-sm font-semibold">
                <DisplayCount amount={asNumber(value)} formatCurrency />
            </div>
        </>
    );
}

/**
 * Keeps a line's chosen serials within what the line allows: none for a product
 * without serial numbers, and at most one per unit of quantity.
 */
function useSerialLimit(rowPath: string, line: Record<string, unknown> | undefined) {
    const { setValue } = useFormContext();
    const hasSerial = asNumber(line?.has_serial) === 1;
    const quantity = Math.max(0, asNumber(line?.quantity));
    const serials = line?.serial;

    useEffect(() => {
        const chosen = Array.isArray(serials) ? serials : [];
        const maxAllowed = Math.max(0, Math.trunc(quantity));
        const options = { shouldDirty: true, shouldValidate: false };

        if (!hasSerial && chosen.length > 0) {
            setValue(`${rowPath}.serial`, [], options);
        } else if (hasSerial && chosen.length > maxAllowed) {
            setValue(`${rowPath}.serial`, chosen.slice(0, maxAllowed), options);
        }
    }, [rowPath, hasSerial, quantity, serials, setValue]);
}

function ProductOutLine({ row, canRemove }: { row: FieldArrayRow; canRemove: boolean }) {
    const { t } = useTranslation();
    const line = useWatch({ name: row.path }) as Record<string, unknown> | undefined;

    useProductLineDetail(row.path, line);
    useSerialLimit(row.path, line);

    const hasSerial = asNumber(line?.has_serial) === 1;
    const hasLot = asNumber(line?.productin_id) > 0;

    return (
        <div className="rounded-md border p-3 space-y-3">
            <div className="mb-1 flex items-center justify-between md:hidden">
                <p className="text-xs font-medium text-muted-foreground">
                    {t("product_out.lines.item", { index: row.index + 1 })}
                </p>
                <MyButton
                    type="button"
                    action="delete"
                    variant="outline"
                    size="sm"
                    onClick={row.remove}
                    disabled={!canRemove}
                    title={t("product_out.lines.remove")}
                />
            </div>

            <div className="md:overflow-x-auto pl-0.5">
                <div className={lineGridClassName}>
                    {row.field("product_id")}
                    {row.field("productin_id")}
                    {row.field("quantity")}
                    {row.field("unit_price")}
                    {row.field("vat")}
                    {row.field("discount")}
                    {row.field("total_price")}
                    <div className="hidden md:flex items-start justify-end pt-7">
                        <MyButton
                            type="button"
                            action="delete"
                            variant="outline"
                            size="icon"
                            onClick={row.remove}
                            disabled={!canRemove}
                            aria-label={t("product_out.lines.remove")}
                        />
                    </div>
                </div>
            </div>

            {hasSerial && hasLot && <ProductOutSerialPicker lineIndex={row.index} />}
        </div>
    );
}

function ProductOutLines({ rows, addRow, canRemove }: FieldArrayRenderProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("product_out.lines.title")}</h3>
                <MyButton
                    type="button"
                    action="add"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    title={t("product_out.lines.add")}
                />
            </div>

            {rows.map((row) => (
                <ProductOutLine key={row.key} row={row} canRemove={canRemove} />
            ))}
        </div>
    );
}

/**
 * The lines of a stock-out: which product, from which lot, how many, and at what price.
 *
 * What each field does is declared here; how a line is laid out is in the components
 * above. A product with serial numbers also gets a serial picker under its line.
 */
export const productOutLinesField: FieldArrayConfig = {
    type: "fieldArray",
    name: "product",
    minItems: 1,
    defaultItem: defaultProductOutLine,
    render: (props) => <ProductOutLines {...props} />,
    itemFields: [
        {
            type: "dropdown",
            name: "product_id",
            className: "min-w-0",
            api: "/dropdown-products?filter=stock",
            isClearable: false,
            label: { labelText: "product_out.line.product.label", mandatory: true },
            placeholder: "product_out.line.product.placeholder",
            // Another product: the chosen lot and serials no longer apply.
            onChange: { set: { productin_id: null, serial: [] } },
        },
        {
            type: "dropdown",
            name: "productin_id",
            className: "min-w-0",
            label: { labelText: "product_out.line.product_in.label" },
            placeholder: "product_out.line.product_in.placeholder",
            // The lots of the chosen product. A new line has product 0, meaning none yet.
            dependsOn: {
                field: "product_id",
                buildApi: (productId) => `/dropdown-product-ins/${productId}`,
                isSet: (productId) => asNumber(productId) > 0,
                resetOnChange: false,
            },
            populate: [{ field: "unit_price", from: "unit_sell_price" }],
            onChange: { set: { serial: [] } },
        },
        {
            type: "number",
            name: "quantity",
            className: "min-w-0",
            step: "any",
            label: { labelText: "product_out.line.quantity.label", mandatory: true },
            placeholder: "product_out.line.quantity.placeholder",
        },
        {
            type: "number",
            name: "unit_price",
            className: "min-w-0",
            step: "any",
            label: { labelText: "product_out.line.unit_price.label", mandatory: true },
            placeholder: "product_out.line.unit_price.placeholder",
        },
        {
            type: "number",
            name: "vat",
            className: "min-w-0",
            step: "any",
            label: { labelText: "product_out.line.vat.label" },
            placeholder: "product_out.line.vat.placeholder",
        },
        {
            type: "number",
            name: "discount",
            className: "min-w-0",
            step: "any",
            reserveErrorSpace: true,
            label: { labelText: "product_out.line.discount.label" },
            placeholder: "product_out.line.discount.placeholder",
        },
        {
            type: "computed",
            name: "total_price",
            className: "flex min-w-0 flex-col gap-1",
            compute: ({ row }) =>
                calculateProductOutLineTotal(
                    Math.max(0, asNumber(row.quantity)),
                    row.unit_price as number,
                    row.vat as number,
                    row.discount as number,
                ),
            display: (value) => <LineTotal value={value} />,
        },
    ],
};

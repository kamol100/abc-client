"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import InputField from "@/components/form/input-field";
import type {
    FieldArrayConfig,
    FieldArrayRenderProps,
    FieldArrayRow,
} from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
import { calculateProductInLineTotal } from "@/components/products/product-in-type";
import { useProductLineDetail } from "@/components/products/use-product-line-detail";
import { toNumber } from "@/lib/helper/helper";

type Line = Record<string, unknown>;

const asNumber = (value: unknown): number => toNumber(value as number | string | null | undefined);

const isNearlyEqual = (left: number, right: number): boolean => Math.abs(left - right) < 0.0001;

/** Category 2 is fibre cable: it is bought by the metre, between two meter marks. */
const FIBER_CATEGORY_ID = 2;

/** A new stock-in line, before the user fills it in. */
export const defaultProductInLine = {
    product_id: 0,
    product_category_id: 1,
    brand: null,
    status: "new" as const,
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

const isFiberLine = (line: Line | undefined): boolean =>
    asNumber(line?.product_category_id) === FIBER_CATEGORY_ID;

/** How many units a line buys: the metres between the marks for fibre, else its quantity. */
const lineQuantity = (line: Line | undefined): number =>
    isFiberLine(line)
        ? Math.max(0, asNumber(line?.fiber_meter_end) - asNumber(line?.fiber_meter_start))
        : Math.max(0, asNumber(line?.quantity));

const lineTotal = (line: Line | undefined): number =>
    Math.max(
        0,
        calculateProductInLineTotal(
            lineQuantity(line),
            line?.unit_price as number,
            line?.vat as number,
        ),
    );

const lineGridClassName =
    "grid grid-cols-1 gap-3 mb-1 ml-0.5 " +
    "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.5fr)_minmax(0,1fr)_auto] " +
    "md:min-w-[1080px]";

/** The line total, shown as money in a box that lines up with the inputs. */
function LineTotal({ value }: { value: number | string | null }) {
    const { t } = useTranslation();
    return (
        <>
            <p className="text-sm font-medium">{t("product_in.line.total.label")}</p>
            <div className="flex h-9 mt-1 items-center justify-end rounded-md border bg-muted/40 px-3 text-sm font-semibold">
                <DisplayCount amount={asNumber(value)} formatCurrency />
            </div>
        </>
    );
}

/** One serial-number input per unit of the line. */
function SerialNumberFields({ row, quantity }: { row: FieldArrayRow; quantity: number }) {
    const { t } = useTranslation();
    const count = Math.max(0, Math.trunc(quantity));

    if (count === 0) return null;

    return (
        <div className="rounded-md border border-dashed p-3">
            <p className="mb-3 text-sm font-medium">{t("product_in.line.serial.title")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-8 gap-3">
                {Array.from({ length: count }).map((_, serialIndex) => (
                    <InputField
                        key={`${row.key}-${serialIndex}`}
                        name={`${row.path}.serial.${serialIndex}`}
                        placeholder={t("product_in.line.serial.placeholder", {
                            index: serialIndex + 1,
                        })}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Keeps a line's serial list the same length as the units it buys: one entry per
 * unit for a product with serial numbers (entries already typed are kept), and none
 * for a product without.
 */
function useSerialSlots(rowPath: string, line: Line | undefined) {
    const { setValue } = useFormContext();
    const hasSerial = asNumber(line?.has_serial) === 1;
    const expectedCount = Math.max(0, Math.trunc(lineQuantity(line)));
    const serials = line?.serial;

    useEffect(() => {
        const current: unknown[] = Array.isArray(serials) ? serials.map((item) => item ?? "") : [];
        const options = { shouldDirty: true, shouldValidate: false };

        if (!hasSerial) {
            if (current.length > 0) setValue(`${rowPath}.serial`, [], options);
            return;
        }

        const next = Array.from({ length: expectedCount }, (_, index) => current[index] ?? "");
        const changed =
            next.length !== current.length || next.some((value, index) => value !== current[index]);
        if (changed) setValue(`${rowPath}.serial`, next, options);
    }, [rowPath, hasSerial, expectedCount, serials, setValue]);
}

function ProductInLine({ row, canRemove }: { row: FieldArrayRow; canRemove: boolean }) {
    const { t } = useTranslation();
    const line = useWatch({ name: row.path }) as Line | undefined;

    useProductLineDetail(row.path, line);
    useSerialSlots(row.path, line);

    const hasSerial = asNumber(line?.has_serial) === 1;

    return (
        <div className="rounded-md border p-3 space-y-3">
            <div className="mb-1 flex items-center justify-between md:hidden">
                <p className="text-xs font-medium text-muted-foreground">
                    {t("product_in.lines.item", { index: row.index + 1 })}
                </p>
                <MyButton
                    type="button"
                    action="delete"
                    variant="outline"
                    size="sm"
                    onClick={row.remove}
                    disabled={!canRemove}
                    title={t("product_in.lines.remove")}
                />
            </div>

            <div className="md:overflow-x-auto">
                <div className={lineGridClassName}>
                    {row.field("product_id")}
                    {row.field("brand")}
                    {row.field("status")}
                    {row.field("quantity")}
                    {row.field("unit_price")}
                    {row.field("unit_sell_price")}
                    {row.field("vat")}
                    {row.field("total_price")}
                    <div className="hidden md:flex items-start justify-end pt-7">
                        <MyButton
                            type="button"
                            action="delete"
                            variant="outline"
                            size="icon"
                            onClick={row.remove}
                            disabled={!canRemove}
                            aria-label={t("product_in.lines.remove")}
                        />
                    </div>
                </div>
            </div>

            {isFiberLine(line) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-md border border-dashed p-3">
                    {row.field("fiberID")}
                    {row.field("fiber_meter_start")}
                    {row.field("fiber_meter_end")}
                </div>
            )}

            {hasSerial && <SerialNumberFields row={row} quantity={asNumber(line?.quantity)} />}
        </div>
    );
}

/** The expense for a purchase is the sum of its lines: keep `expense.amount` equal to it. */
function useExpenseAmountFromLines() {
    const { getValues, setValue } = useFormContext();
    const lines = useWatch({ name: "product" }) as Line[] | undefined;

    useEffect(() => {
        const total = (lines ?? []).reduce((sum, line) => sum + lineTotal(line), 0);
        if (isNearlyEqual(asNumber(getValues("expense.amount")), total)) return;
        setValue("expense.amount", total, { shouldDirty: true, shouldValidate: false });
    }, [lines, getValues, setValue]);
}

function ProductInLines({ rows, addRow, canRemove }: FieldArrayRenderProps) {
    const { t } = useTranslation();
    useExpenseAmountFromLines();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t("product_in.lines.title")}</h3>
                <MyButton
                    type="button"
                    action="add"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    title={t("product_in.lines.add")}
                />
            </div>

            {rows.map((row) => (
                <ProductInLine key={row.key} row={row} canRemove={canRemove} />
            ))}
        </div>
    );
}

/**
 * The lines of a stock-in (a purchase): which product, how many, and at what price.
 *
 * What each field does is declared here; how a line is laid out is in the components
 * above. Fibre cable gets its meter-mark fields under the line, and a product with
 * serial numbers gets one serial input per unit.
 */
export const productInLinesField: FieldArrayConfig = {
    type: "fieldArray",
    name: "product",
    minItems: 1,
    defaultItem: defaultProductInLine,
    render: (props) => <ProductInLines {...props} />,
    itemFields: [
        {
            type: "dropdown",
            name: "product_id",
            className: "min-w-0",
            api: "/dropdown-products",
            isClearable: false,
            label: { labelText: "product_in.line.product.label", mandatory: true },
            placeholder: "product_in.line.product.placeholder",
            // Another product: what was entered for the old one no longer applies.
            // Serial and category are set again from the new product's details.
            onChange: {
                set: {
                    has_serial: 0,
                    product_category_id: 1,
                    serial: [],
                    fiberID: null,
                    fiber_meter_start: null,
                    fiber_meter_end: null,
                },
            },
        },
        {
            type: "text",
            name: "brand",
            className: "min-w-0",
            reserveErrorSpace: true,
            label: { labelText: "product_in.line.brand.label" },
            placeholder: "product_in.line.brand.placeholder",
        },
        {
            type: "dropdown",
            name: "status",
            className: "min-w-0",
            isClearable: false,
            options: [
                { value: "new", label: "product_in.status.new" },
                { value: "old", label: "product_in.status.old" },
                { value: "replace", label: "product_in.status.replace" },
            ],
            label: { labelText: "product_in.line.status.label" },
            placeholder: "product_in.line.status.placeholder",
        },
        {
            type: "number",
            name: "quantity",
            className: "min-w-0",
            step: "any",
            label: { labelText: "product_in.line.quantity.label", mandatory: true },
            placeholder: "product_in.line.quantity.placeholder",
        },
        {
            type: "number",
            name: "unit_price",
            className: "min-w-0",
            step: "any",
            label: { labelText: "product_in.line.unit_price.label", mandatory: true },
            placeholder: "product_in.line.unit_price.placeholder",
        },
        {
            type: "number",
            name: "unit_sell_price",
            className: "min-w-0",
            step: "any",
            label: { labelText: "product_in.line.unit_sell_price.label" },
            placeholder: "product_in.line.unit_sell_price.placeholder",
        },
        {
            type: "number",
            name: "vat",
            className: "min-w-0",
            step: "any",
            reserveErrorSpace: true,
            label: { labelText: "product_in.line.vat.label" },
            placeholder: "product_in.line.vat.placeholder",
        },
        {
            type: "computed",
            name: "total_price",
            className: "flex min-w-0 flex-col gap-1",
            compute: ({ row }) => lineTotal(row),
            display: (value) => <LineTotal value={value} />,
        },
        // Fibre cable only; drawn under the line.
        {
            type: "text",
            name: "fiberID",
            label: { labelText: "product_in.line.fiber.fiber_id.label" },
            placeholder: "product_in.line.fiber.fiber_id.placeholder",
        },
        {
            type: "number",
            name: "fiber_meter_start",
            label: { labelText: "product_in.line.fiber.meter_start.label" },
            placeholder: "product_in.line.fiber.meter_start.placeholder",
        },
        {
            type: "number",
            name: "fiber_meter_end",
            label: { labelText: "product_in.line.fiber.meter_end.label" },
            placeholder: "product_in.line.fiber.meter_end.placeholder",
        },
    ],
};

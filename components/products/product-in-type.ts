import { z } from "zod";
import { toApiDateString, toNumber } from "@/lib/helper/helper";

const PRODUCT_IN_STATUS = ["new", "old", "replace"] as const;

const toDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return undefined;
};

const OptionalDateValueSchema = z.preprocess(
    (value) => {
        if (value === null || value === undefined || value === "") return undefined;
        return toDate(value);
    },
    z.date().optional(),
);

const normalizeText = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

export const calculateProductInLineTotal = (
    quantity: number | string | null | undefined,
    unitPrice: number | string | null | undefined,
    vat: number | string | null | undefined,
): number => {
    const base = toNumber(quantity) * toNumber(unitPrice);
    const vatPercent = toNumber(vat);
    if (vatPercent <= 0) return base;
    return base + (base * vatPercent) / 100;
};

export const StaffRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
});

export const FundRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
});

export const VendorRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
});

export const ExpenseTypeRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
});

export const ProductInLineSchema = z
    .object({
        product_id: z.coerce.number({
            required_error: "product_in.errors.product_required",
            invalid_type_error: "product_in.errors.product_required",
        }).min(1, { message: "product_in.errors.product_required" }),
        product_category_id: z.coerce.number().nullable().optional(),
        brand: z.string().max(180).nullable().optional(),
        status: z.enum(PRODUCT_IN_STATUS).default("new"),
        quantity: z.coerce.number().min(0, {
            message: "product_in.errors.quantity_min",
        }),
        unit_price: z.coerce.number().min(0, {
            message: "product_in.errors.unit_price_min",
        }),
        unit_sell_price: z.coerce.number().min(0).default(0),
        vat: z.coerce.number().min(0, {
            message: "product_in.errors.vat_min",
        }).default(0),
        total_price: z.coerce.number().min(0).default(0),
        has_serial: z.coerce.number().int().min(0).max(1).default(0),
        serial: z.array(z.string()).default([]),
        fiberID: z.string().nullable().optional(),
        fiber_meter_start: z.coerce.number().nullable().optional(),
        fiber_meter_end: z.coerce.number().nullable().optional(),
    })
    .superRefine((line, ctx) => {
        if (line.product_category_id === 2 && toNumber(line.quantity) < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["quantity"],
                message: "product_in.errors.quantity_min",
            });
        }

        if (line.has_serial !== 1) return;

        const expectedCount = Math.max(0, Math.trunc(toNumber(line.quantity)));
        const serials = (line.serial ?? []).map((item) => item?.trim?.() ?? "");

        if (serials.length !== expectedCount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["serial"],
                message: "product_in.errors.serial_count",
            });
            return;
        }

        const hasEmptySerial = serials.some((item) => item.length === 0);
        if (hasEmptySerial) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["serial"],
                message: "product_in.errors.serial_required",
            });
        }
    });

export const ProductInExpenseSchema = z.object({
    expense_type_id: z.coerce.number().min(1, {
        message: "product_in.errors.expense_type_required",
    }),
    vendor_id: z.coerce.number().nullable().optional(),
    fund_id: z.coerce.number().nullable().optional(),
    amount: z.coerce.number().min(0).default(0),
    note: z.string().nullable().optional(),
});

const ProductInFormSchemaBase = z.object({
    purchase_by: z.coerce.number({
        required_error: "product_in.errors.purchase_by_required",
        invalid_type_error: "product_in.errors.purchase_by_required",
    }).min(1, { message: "product_in.errors.purchase_by_required" }),
    purchase_date: OptionalDateValueSchema,
    voucher: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    expense: z
        .object({
            expense_type_id: z.coerce.number().nullable().optional(),
            vendor_id: z.coerce.number().nullable().optional(),
            fund_id: z.coerce.number().nullable().optional(),
            amount: z.coerce.number().min(0).default(0),
            note: z.string().nullable().optional(),
        })
        .optional(),
    product: z.array(ProductInLineSchema).min(1, {
        message: "product_in.errors.product_min",
    }),
});

export const ProductInPayloadLineSchema = z.object({
    product_id: z.coerce.number().min(1),
    product_category_id: z.coerce.number().nullable().optional(),
    brand: z.string().nullable().optional(),
    status: z.enum(PRODUCT_IN_STATUS),
    quantity: z.coerce.number().min(0),
    unit_price: z.coerce.number().min(0),
    unit_sell_price: z.coerce.number().min(0),
    vat: z.coerce.number().min(0),
    total_price: z.coerce.number().min(0),
    has_serial: z.coerce.number().int().min(0).max(1),
    serial: z.array(z.string()).default([]),
    fiberID: z.string().nullable().optional(),
    fiber_meter_start: z.coerce.number().nullable().optional(),
    fiber_meter_end: z.coerce.number().nullable().optional(),
});

export const ProductInPayloadExpenseSchema = z.object({
    expense_type_id: z.coerce.number().min(1),
    vendor_id: z.coerce.number().nullable().optional(),
    fund_id: z.coerce.number().nullable().optional(),
    amount: z.coerce.number().min(0),
    note: z.string().nullable().optional(),
});

export const ProductInPayloadSchema = z.object({
    purchase_by: z.coerce.number().min(1),
    purchase_date: z.string().nullable().optional(),
    voucher: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    expense: ProductInPayloadExpenseSchema.nullable().optional(),
    product: z.array(ProductInPayloadLineSchema).min(1),
    total_quantity: z.coerce.number().min(0),
    total_amount: z.coerce.number().min(0),
});

export const ProductInFormSchema = ProductInFormSchemaBase
    .superRefine((values, ctx) => {
        if (!values.expense) return;

        const hasOtherExpenseInput =
            !!values.expense.vendor_id ||
            !!values.expense.fund_id ||
            !!normalizeText(values.expense.note) ||
            toNumber(values.expense.amount) > 0;

        if (hasOtherExpenseInput && !toNumber(values.expense.expense_type_id)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["expense", "expense_type_id"],
                message: "product_in.errors.expense_type_required",
            });
        }
    })
    .transform((values) => {
        const normalizedLines = values.product.map((line) => {
            const quantity = Math.max(0, toNumber(line.quantity));
            const unitPrice = toNumber(line.unit_price);
            const vat = Math.max(0, toNumber(line.vat));

            return {
                product_id: toNumber(line.product_id),
                product_category_id: line.product_category_id ?? null,
                brand: normalizeText(line.brand),
                status: line.status,
                quantity,
                unit_price: unitPrice,
                unit_sell_price: Math.max(0, toNumber(line.unit_sell_price)),
                vat,
                total_price: Math.max(
                    0,
                    calculateProductInLineTotal(quantity, unitPrice, vat),
                ),
                has_serial: Math.min(1, Math.max(0, toNumber(line.has_serial))),
                serial: (line.serial ?? []).map((item) => item.trim()),
                fiberID: normalizeText(line.fiberID),
                fiber_meter_start:
                    line.fiber_meter_start === null || line.fiber_meter_start === undefined
                        ? null
                        : toNumber(line.fiber_meter_start),
                fiber_meter_end:
                    line.fiber_meter_end === null || line.fiber_meter_end === undefined
                        ? null
                        : toNumber(line.fiber_meter_end),
            };
        });

        const totalAmount = normalizedLines.reduce(
            (sum, line) => sum + toNumber(line.total_price),
            0,
        );
        const totalQuantity = normalizedLines.reduce(
            (sum, line) => sum + toNumber(line.quantity),
            0,
        );

        const payload = {
            purchase_by: toNumber(values.purchase_by),
            purchase_date: toApiDateString(values.purchase_date) ?? null,
            voucher: normalizeText(values.voucher),
            note: normalizeText(values.note),
            expense:
                values.expense && toNumber(values.expense.expense_type_id) > 0
                    ? {
                        expense_type_id: toNumber(values.expense.expense_type_id),
                        vendor_id: values.expense.vendor_id
                            ? toNumber(values.expense.vendor_id)
                            : null,
                        fund_id: values.expense.fund_id
                            ? toNumber(values.expense.fund_id)
                            : null,
                        amount: Math.max(0, totalAmount),
                        note: normalizeText(values.expense.note),
                    }
                    : null,
            product: normalizedLines,
            total_quantity: totalQuantity,
            total_amount: totalAmount,
        };

        return ProductInPayloadSchema.parse(payload);
    });

export type ProductInLine = z.infer<typeof ProductInLineSchema>;
export type ProductInFormState = z.infer<typeof ProductInFormSchemaBase>;
export type ProductInFormInput = z.input<typeof ProductInFormSchema>;
export type ProductInPayload = z.output<typeof ProductInPayloadSchema>;

import { z } from "zod";
import { toApiDateString, toNumber } from "@/lib/helper/helper";

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

export const calculateProductOutLineTotal = (
    quantity: number | string | null | undefined,
    unitPrice: number | string | null | undefined,
    vat: number | string | null | undefined,
    discount: number | string | null | undefined,
): number => {
    const base = toNumber(quantity) * toNumber(unitPrice);
    const vatPercent = toNumber(vat);
    const discountedBase = vatPercent > 0 ? base + (base * vatPercent) / 100 : base;
    return discountedBase - toNumber(discount);
};

export const ProductOutLineSchema = z
    .object({
        product_id: z.coerce.number({
            required_error: "product_out.errors.product_required",
            invalid_type_error: "product_out.errors.product_required",
        }).min(1, { message: "product_out.errors.product_required" }),
        productin_id: z.coerce.number().nullable().optional(),
        product_category_id: z.coerce.number().nullable().optional(),
        quantity: z.coerce.number().min(0, {
            message: "product_out.errors.quantity_min",
        }),
        unit_price: z.coerce.number().min(0, {
            message: "product_out.errors.unit_price_min",
        }),
        vat: z.coerce.number().min(0, {
            message: "product_out.errors.vat_min",
        }).default(0),
        discount: z.coerce.number().min(0, {
            message: "product_out.errors.discount_min",
        }).default(0),
        total_price: z.coerce.number().default(0),
        has_serial: z.coerce.number().int().min(0).max(1).default(0),
        serial: z.array(z.coerce.number()).default([]),
        fiberID: z.string().nullable().optional(),
        fiber_meter_start: z.coerce.number().nullable().optional(),
        fiber_meter_end: z.coerce.number().nullable().optional(),
    })
    .superRefine((line, ctx) => {
        if (line.has_serial !== 1) return;

        if (!toNumber(line.productin_id)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["productin_id"],
                message: "product_out.errors.product_in_required",
            });
        }

        const expectedCount = Math.max(0, Math.trunc(toNumber(line.quantity)));
        const serialCount = (line.serial ?? []).length;

        if (serialCount <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["serial"],
                message: "product_out.errors.serial_required",
            });
            return;
        }

        if (serialCount !== expectedCount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["serial"],
                message: "product_out.errors.serial_count",
            });
        }
    });

const ProductOutFormSchemaBase = z.object({
    out_date: OptionalDateValueSchema,
    received_by: z.coerce.number({
        required_error: "product_out.errors.received_by_required",
        invalid_type_error: "product_out.errors.received_by_required",
    }).min(1, { message: "product_out.errors.received_by_required" }),
    client_id: z.coerce.number().nullable().optional(),
    create_invoice: z.coerce.number().int().min(0).max(1).default(0),
    note: z.string().nullable().optional(),
    product: z.array(ProductOutLineSchema).min(1, {
        message: "product_out.errors.product_min",
    }),
});

export const ProductOutPayloadLineSchema = z.object({
    product_id: z.coerce.number().min(1),
    productin_id: z.coerce.number().nullable().optional(),
    product_category_id: z.coerce.number().nullable().optional(),
    quantity: z.coerce.number().min(0),
    unit_price: z.coerce.number().min(0),
    vat: z.coerce.number().min(0),
    discount: z.coerce.number().min(0),
    total_price: z.coerce.number(),
    has_serial: z.coerce.number().int().min(0).max(1),
    serial: z.array(z.coerce.number()).default([]),
    fiberID: z.string().nullable().optional(),
    fiber_meter_start: z.coerce.number().nullable().optional(),
    fiber_meter_end: z.coerce.number().nullable().optional(),
});

export const ProductOutPayloadSchema = z.object({
    out_date: z.string().nullable().optional(),
    received_by: z.coerce.number().min(1),
    client_id: z.coerce.number().nullable().optional(),
    create_invoice: z.coerce.number().int().min(0).max(1),
    note: z.string().nullable().optional(),
    product: z.array(ProductOutPayloadLineSchema).min(1),
    total_quantity: z.coerce.number().min(0),
    total_discount: z.coerce.number().min(0),
    total_amount: z.coerce.number(),
});

export const ProductOutFormSchema = ProductOutFormSchemaBase.transform((values) => {
    const normalizedLines = values.product.map((line) => {
        const quantity = Math.max(0, toNumber(line.quantity));
        const unitPrice = Math.max(0, toNumber(line.unit_price));
        const vat = Math.max(0, toNumber(line.vat));
        const discount = Math.max(0, toNumber(line.discount));
        const computedTotal = calculateProductOutLineTotal(
            quantity,
            unitPrice,
            vat,
            discount,
        );

        return {
            product_id: toNumber(line.product_id),
            productin_id: line.productin_id ? toNumber(line.productin_id) : null,
            product_category_id: line.product_category_id ?? null,
            quantity,
            unit_price: unitPrice,
            vat,
            discount,
            total_price: computedTotal,
            has_serial: Math.min(1, Math.max(0, toNumber(line.has_serial))),
            serial: (line.serial ?? []).map((id) => toNumber(id)),
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

    const totalQuantity = normalizedLines.reduce(
        (sum, line) => sum + toNumber(line.quantity),
        0,
    );
    const totalDiscount = normalizedLines.reduce(
        (sum, line) => sum + toNumber(line.discount),
        0,
    );
    const totalAmount = normalizedLines.reduce(
        (sum, line) => sum + toNumber(line.total_price),
        0,
    );

    const payload = {
        out_date: toApiDateString(values.out_date) ?? null,
        received_by: toNumber(values.received_by),
        client_id: values.client_id ? toNumber(values.client_id) : null,
        create_invoice: Math.min(1, Math.max(0, toNumber(values.create_invoice))),
        note: normalizeText(values.note),
        product: normalizedLines,
        total_quantity: totalQuantity,
        total_discount: totalDiscount,
        total_amount: totalAmount,
    };

    return ProductOutPayloadSchema.parse(payload);
});

export type ProductOutLine = z.infer<typeof ProductOutLineSchema>;
export type ProductOutFormState = z.infer<typeof ProductOutFormSchemaBase>;
export type ProductOutFormInput = z.input<typeof ProductOutFormSchema>;
export type ProductOutPayload = z.output<typeof ProductOutPayloadSchema>;

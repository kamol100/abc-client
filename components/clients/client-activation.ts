import { toApiDateString } from "@/lib/helper/helper";
import { z } from "zod";

export const INTERNET_BILL_REQUIRED = "internet_bill_required";

export type ActivationInvoicePreview = {
    pppoe_username: string | null;
    client_name: string | null;
    package_name: string | null;
    package_price: number;
    create_date: string;
    create_date_label: string;
    month_label: string;
    remaining_days: number;
    adjust_amount: number;
    payment_deadline: number;
    termination_date: string | null;
};

const textOrNull = (value: unknown): string | null =>
    typeof value === "string" && value !== "" ? value : null;

const finiteNumber = (value: unknown): number | null => {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : null;
};

export function activationPreview(error: unknown): ActivationInvoicePreview | null {
    const body = error as { error?: { code?: unknown; preview?: unknown } } | null;
    if (body?.error?.code !== INTERNET_BILL_REQUIRED || !body.error.preview || typeof body.error.preview !== "object") {
        return null;
    }

    const row = body.error.preview as Record<string, unknown>;
    const packagePrice = finiteNumber(row.package_price);
    const adjustAmount = finiteNumber(row.adjust_amount);
    const remainingDays = finiteNumber(row.remaining_days);
    const paymentDeadline = finiteNumber(row.payment_deadline);
    if (packagePrice === null || adjustAmount === null || remainingDays === null || paymentDeadline === null) {
        return null;
    }

    return {
        pppoe_username: textOrNull(row.pppoe_username),
        client_name: textOrNull(row.client_name),
        package_name: textOrNull(row.package_name),
        package_price: packagePrice,
        create_date: textOrNull(row.create_date) ?? "",
        create_date_label: textOrNull(row.create_date_label) ?? "",
        month_label: textOrNull(row.month_label) ?? "",
        remaining_days: remainingDays,
        adjust_amount: adjustAmount,
        payment_deadline: paymentDeadline,
        termination_date: textOrNull(row.termination_date),
    };
}

export function activationAmountsMatch(entered: number, calculated: number): boolean {
    return Math.round(entered * 100) === Math.round(calculated * 100);
}

const terminationDate = z.preprocess((value) => {
    if (value == null || value === "") return null;
    if (value instanceof Date || typeof value === "string") return toApiDateString(value);
    return null;
}, z.string().nullable());

export const ActivationInvoiceSchema = z.object({
    amount: z.coerce.number({
        required_error: "client.activation.amount.errors.required",
        invalid_type_error: "client.activation.amount.errors.invalid",
    }).min(1, { message: "client.activation.amount.errors.min" }),
    payment_deadline: z.coerce.number({
        required_error: "client.activation.deadline.errors.required",
        invalid_type_error: "client.activation.deadline.errors.required",
    }).int().min(1).max(30),
    termination_date: terminationDate,
    note: z.string().trim().min(1, { message: "client.activation.note.errors.required" }),
});

export type ActivationInvoiceInput = z.input<typeof ActivationInvoiceSchema>;
export type ActivationInvoicePayload = z.output<typeof ActivationInvoiceSchema>;

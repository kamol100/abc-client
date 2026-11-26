import { z } from "zod";
import { toNumber } from "@/lib/helper/helper";
import type { InvoiceRow } from "@/components/invoices/invoice-type";

/**
 * An invoice billed to the signed-in reseller, as GET /reseller-invoices returns it.
 * `id` is the invoice uuid. The rest of the row (lines, bill_to, issuer) is only
 * passed on to the invoice view.
 */
export type ResellerBillRow = {
    id?: string | null;
    trackID?: string | null;
    create_date?: string | null;
    due_date?: string | null;
    after_discount_amount?: number | string | null;
    amount_paid?: number | string | null;
    amount_due?: number | string | null;
    status?: InvoiceRow["status"];
    invoice_type?: InvoiceRow["invoice_type"];
    [key: string]: unknown;
};

/** What is still owed on a bill. */
export const resellerBillDue = (bill: ResellerBillRow): number => {
    if (bill.amount_due != null) return Math.max(toNumber(bill.amount_due), 0);
    return Math.max(toNumber(bill.after_discount_amount) - toNumber(bill.amount_paid), 0);
};

export const resellerBillIsUnpaid = (bill: ResellerBillRow): boolean =>
    bill.status !== "paid" && resellerBillDue(bill) > 0;

/**
 * Paying a bill from the reseller wallet. An empty amount pays everything that
 * is due; a part payment is a whole amount below the due.
 */
export const resellerBillPaySchema = (due: number) =>
    z
        .object({
            amount: z.preprocess(
                (value) => (value === "" || value === null || value === undefined ? undefined : value),
                z.coerce
                    .number({ invalid_type_error: "reseller_bill.pay.amount.errors.min" })
                    .min(1, { message: "reseller_bill.pay.amount.errors.min" })
                    .max(due, { message: "reseller_bill.pay.amount.errors.max" })
                    .optional(),
            ),
            note: z.string().trim().max(255, { message: "reseller_bill.pay.note.errors.max" }).nullable().optional(),
        })
        .superRefine((values, ctx) => {
            const amount = values.amount;
            if (amount !== undefined && amount < due && !Number.isInteger(amount)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["amount"],
                    message: "reseller_bill.pay.amount.errors.whole",
                });
            }
        })
        .transform((values) => ({
            ...(values.amount === undefined ? {} : { amount: values.amount }),
            ...(values.note ? { note: values.note } : {}),
        }));

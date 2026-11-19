import { z } from "zod";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { parseReferralDecimal } from "@/components/referrals/referral-amount";
import { payoutMethods, sellerTypes } from "@/components/referrals/referral-type";

const required = "referral.validation.required";
const amount = "referral.validation.amount";
const requiredText = (max: number) => z.string({ required_error: required }).trim().min(1, required).max(max, "referral.validation.length");
const money = (limit?: number, message = amount) => z.string({ required_error: required }).transform((value, ctx) => {
  const parsed = parseReferralDecimal(value, limit);
  if (parsed !== null) return parsed;
  ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  return z.NEVER;
});
const optionalText = (max: number) => z.string().trim().max(max, "referral.validation.length").nullish().transform((value) => value || undefined);
const optionalAmount = money().or(z.literal("").transform(() => undefined)).nullish().transform((value) => value ?? undefined);
const code = requiredText(32).refine((value) => /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(value), "referral.validation.code");
const demoId = z.string().trim().regex(/^\d+$/, "referral.validation.demo_id").refine((value) => Number(value) > 0 && Number.isSafeInteger(Number(value)), "referral.validation.demo_id").transform(Number)
  .or(z.literal("").transform(() => undefined)).nullish().transform((value) => value ?? undefined);

export const referralCaptureSchema = z.object({
  prospect_name: requiredText(200),
  estimated_sale_minor: optionalAmount,
});

export const assistedReferralSchema = z.object({
  prospect_name: optionalText(200),
  demo_request_id: demoId,
  referral_code: code,
  estimated_sale_minor: optionalAmount,
}).refine((value) => Boolean(value.prospect_name || value.demo_request_id), { path: ["prospect_name"], message: required });

export const sellerEnrollmentSchema = z.object({
  user_uuid: requiredText(36).uuid("referral.validation.user_uuid"),
  seller_type: z.enum(sellerTypes, { required_error: required }),
  code,
});

const effectiveDate = z.date({ required_error: required, invalid_type_error: required }).transform((value) => value.toISOString());
export const contractFormSchema = z.discriminatedUnion("commission_type", [
  z.object({ commission_type: z.literal("fixed"), fixed_amount_minor: money(), effective_at: effectiveDate }),
  z.object({ commission_type: z.literal("percentage"), rate_bps: money(10_000, "referral.validation.rate"), effective_at: effectiveDate }),
]);

export const approvalFormSchema = z.object({
  approved_sale_minor: money(),
  decision_note: optionalText(2000),
});
export const rejectionFormSchema = z.object({ decision_note: requiredText(2000) });
export const payoutFormSchema = z.object({
  method: z.enum(payoutMethods, { required_error: required }),
  transfer_reference: requiredText(100),
  paid_at: z.date({ required_error: required, invalid_type_error: required })
    .refine((value) => value.getTime() <= Date.now(), "referral.validation.paid_at")
    .transform((value) => value.toISOString()),
});

const text = (name: string, mandatory = false): FieldConfig => ({
  type: "text", name, label: { labelText: `referral.fields.${name}`, mandatory },
  placeholder: `referral.placeholders.${name}`, className: "min-h-20",
});

export function captureFields(assisted: boolean, fromDemo: boolean): FieldConfig[] {
  if (!assisted) return [text("prospect_name", true), text("estimated_sale_minor")];
  return [
    text("referral_code", true),
    ...(fromDemo ? [] : [text("demo_request_id"), text("prospect_name")]),
    text("estimated_sale_minor"),
  ];
}

export const enrollmentFields: FieldConfig[] = [
  text("user_uuid", true),
  {
    type: "dropdown", name: "seller_type", label: { labelText: "referral.fields.seller_type", mandatory: true },
    placeholder: "referral.select_seller_type", className: "min-h-20",
    options: sellerTypes.map((value) => ({ value, label: `referral.seller_type.${value}` })),
  },
  text("code", true),
];

export const contractFields: FieldConfig[] = [
  {
    type: "radio", name: "commission_type", label: { labelText: "referral.fields.commission_type", mandatory: true },
    defaultValue: "fixed",
    options: ["fixed", "percentage"].map((value) => ({ value, label: `referral.terms.${value}` })),
  },
  { ...text("fixed_amount_minor", true), visibleWhen: { field: "commission_type", equals: "fixed" } },
  { ...text("rate_bps", true), visibleWhen: { field: "commission_type", equals: "percentage" } },
  {
    type: "date", name: "effective_at", label: { labelText: "referral.fields.effective_at", mandatory: true },
    placeholder: "referral.placeholders.effective_at", closeOnSelectDate: true, className: "min-h-20",
  },
];

const noteField: FieldConfig = {
  type: "textarea", name: "decision_note", rows: 2, className: "min-h-27", label: { labelText: "referral.fields.decision_note" },
  placeholder: "referral.placeholders.decision_note",
};

export const approvalFields: FieldConfig[] = [text("approved_sale_minor", true), noteField];
export const rejectionFields: FieldConfig[] = [{
  ...noteField,
  label: { labelText: "referral.fields.decision_note", mandatory: true },
  placeholder: "referral.placeholders.rejection_note",
}];
export const payoutFields: FieldConfig[] = [
  {
    type: "dropdown", name: "method", label: { labelText: "referral.fields.method", mandatory: true },
    placeholder: "referral.select_method", className: "min-h-20",
    options: payoutMethods.map((value) => ({ value, label: `referral.methods.${value}` })),
  },
  text("transfer_reference", true),
  {
    type: "date", name: "paid_at", label: { labelText: "referral.fields.paid_at", mandatory: true },
    placeholder: "referral.placeholders.paid_at", closeOnSelectDate: true, className: "min-h-20",
  },
];

import { normalizeDateOnlyInput } from "@/lib/helper/helper";
import { z } from "zod";

const optionalDate = z.preprocess((value) => {
  const normalized = normalizeDateOnlyInput(value);
  return typeof normalized === "string" ? normalized : null;
}, z.string().nullable());

export const SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due", "canceled", "expired"] as const;

export const CompanySubscriptionRowSchema = z.object({
  id: z.string(),
  status: z.string(),
  trial_days: z.coerce.number().optional(),
  grace_days: z.coerce.number().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  canceled_at: z.string().nullable().optional(),
  company: z.object({ id: z.string(), name: z.string() }).optional(),
  plan: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
}).passthrough();

export type CompanySubscriptionRow = z.infer<typeof CompanySubscriptionRowSchema>;

export const CompanySubscriptionFormSchema = z.object({
  company_id: z.string().min(1, { message: "subscription.company.company_required" }),
  plan_id: z.string().min(1, { message: "subscription.company.plan_required" }),
  status: z.enum(SUBSCRIPTION_STATUSES).default("active"),
  trial_days: z.coerce.number().min(0).optional().default(0),
  grace_days: z.coerce.number().min(0).optional().default(0),
  starts_at: optionalDate,
  ends_at: optionalDate,
});

export type CompanySubscriptionFormInput = z.input<typeof CompanySubscriptionFormSchema>;
export type CompanySubscriptionPayload = z.output<typeof CompanySubscriptionFormSchema>;

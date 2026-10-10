import { z } from "zod";

export const SubscriptionPlanRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.coerce.number(),
  billing_interval: z.string(),
  min_clients: z.coerce.number().optional(),
  max_clients: z.coerce.number().optional(),
  is_active: z.boolean().optional(),
  features: z.array(z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    expired_mode: z.string(),
  })).optional(),
}).passthrough();

export type SubscriptionPlanRow = z.infer<typeof SubscriptionPlanRowSchema>;

export const SubscriptionPlanFormSchema = z.object({
  name: z.string().min(1, { message: "subscription.plan.name_required" }),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0, { message: "subscription.plan.price_required" }),
  billing_interval: z.enum(["month", "year"]),
  min_clients: z.coerce.number().min(0).optional().default(0),
  max_clients: z.coerce.number().min(0).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export type SubscriptionPlanFormInput = z.input<typeof SubscriptionPlanFormSchema>;

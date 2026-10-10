import { z } from "zod";

const featureKeyPattern = /^[a-z][a-z0-9_]*$/;

export const FeatureRowSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sort_order: z.coerce.number().optional(),
  permissions_count: z.coerce.number().optional(),
}).passthrough();

export type FeatureRow = z.infer<typeof FeatureRowSchema>;

export const FeatureFormSchema = z.object({
  name: z.string().min(1, { message: "subscription.feature.name_required" }),
  description: z.string().optional().default(""),
  sort_order: z.coerce.number().min(0, { message: "subscription.feature.sort_order_invalid" }).optional().default(0),
});

export const FeatureCreateSchema = FeatureFormSchema.extend({
  key: z
    .string()
    .min(1, { message: "subscription.feature.key_required" })
    .regex(featureKeyPattern, { message: "subscription.feature.key_invalid" }),
});

export type FeatureFormInput = z.input<typeof FeatureCreateSchema>;
export type FeaturePayload = z.output<typeof FeatureCreateSchema>;

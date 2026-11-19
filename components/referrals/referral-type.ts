import { z } from "zod";
import type { ApiResponse, PaginatedData } from "@/hooks/use-api-query";

export const referralStatuses = ["pending", "payable", "paid", "rejected"] as const;
export const sellerTypes = ["tenant_manager", "reseller", "independent"] as const;
export const payoutMethods = ["bank", "bkash", "nagad", "rocket", "cash"] as const;

const termsSchema = z.object({
  commission_type: z.enum(["fixed", "percentage"]),
  fixed_amount_minor: z.number().nullable(),
  rate_bps: z.number().nullable(),
});

export const ReferralContractSchema = termsSchema.extend({
  id: z.number(),
  effective_at: z.string(),
});

export const ReferralSellerSchema = z.object({
  id: z.number(),
  user_uuid: z.string().nullable().optional(),
  display_name: z.string(),
  seller_type: z.enum(sellerTypes),
  code: z.string(),
  status: z.enum(["active", "inactive"]),
  contracts: z.array(ReferralContractSchema).optional(),
});

export const ReferralRowSchema = termsSchema.extend({
  uuid: z.string(),
  prospect_name: z.string(),
  status: z.enum(referralStatuses),
  submitted_at: z.string(),
  estimated_sale_minor: z.number().nullable(),
  pending_amount_minor: z.number().nullable(),
  is_estimate: z.boolean(),
  commission_amount_minor: z.number().nullable(),
  tenant_linked: z.boolean(),
  tenant_available: z.boolean().optional(),
  approved_sale_minor: z.number().nullable().optional(),
  decided_at: z.string().nullable().optional(),
  decision_note: z.string().nullable().optional(),
  demo_request_id: z.number().nullable().optional(),
  customer_company_uuid: z.string().nullable().optional(),
  seller: ReferralSellerSchema.pick({ id: true, display_name: true, seller_type: true }).optional(),
  payout: z.object({
    amount_minor: z.number(),
    method: z.enum(payoutMethods),
    paid_at: z.string(),
    transfer_reference: z.string(),
  }).nullable(),
});

export type ReferralRow = z.infer<typeof ReferralRowSchema>;
export type ReferralSeller = z.infer<typeof ReferralSellerSchema>;
export type ReferralTerms = z.infer<typeof termsSchema>;
export type ReferralTotals = Record<"pending_minor" | "payable_minor" | "paid_minor", number>;
export type ReferralActions = Record<"can_submit" | "can_attribute" | "can_approve" | "can_reject" | "can_record_payout", boolean>;
export type ReferralList = ApiResponse<PaginatedData<ReferralRow> & {
  totals: ReferralTotals;
  actions: ReferralActions;
  seller: Pick<ReferralSeller, "code" | "display_name" | "seller_type" | "status"> | null;
}>;

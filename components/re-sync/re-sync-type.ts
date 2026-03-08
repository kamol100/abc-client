import { z } from "zod";

export const ResellerRefSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().nullable().optional(),
  })
  .passthrough();

export const ReSyncRowSchema = z
  .object({
    id: z.coerce.number(),
    reseller: ResellerRefSchema.nullable().optional(),
    client_in_mikrotik: z.string().nullable().optional(),
    client_in_app: z.string().nullable().optional(),
    mikrotik_profile: z.string().nullable().optional(),
    app_profile: z.string().nullable().optional(),
    profile_match: z.string().nullable().optional(),
    client_status_mikrotik: z.string().nullable().optional(),
    client_status_app: z.string().nullable().optional(),
    mikrotik_match: z.coerce.number().optional(),
    syncable: z.coerce.number().optional(),
  })
  .passthrough();

export const ReSyncListDataSchema = z
  .object({
    data: z.array(ReSyncRowSchema).default([]),
    pagination: z.custom<Pagination>().optional(),
    match_count: z.coerce.number().default(0),
    not_match_count: z.coerce.number().default(0),
    summary: z.string().nullable().optional(),
  })
  .passthrough();

export const ReSyncFormSchema = z.object({
  network_id: z.coerce
    .number({
      required_error: "re_sync.sync.network.errors.required",
    })
    .min(1, {
      message: "re_sync.sync.network.errors.required",
    }),
});

export type ReSyncRow = z.infer<typeof ReSyncRowSchema>;
export type ReSyncListData = z.infer<typeof ReSyncListDataSchema>;
export type ReSyncFormInput = z.input<typeof ReSyncFormSchema>;
export type ReSyncPayload = z.output<typeof ReSyncFormSchema>;

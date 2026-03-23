import { z } from "zod";

const NullableNumberSchema = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}, z.number().nullable().optional());

const RefSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
  })
  .passthrough();

export const SmsTemplateSummarySchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
    message: z.string().nullable().optional(),
    template_type: z.string().nullable().optional(),
  })
  .passthrough();

export type SmsTemplateSummary = z.infer<typeof SmsTemplateSummarySchema>;

export const SmsSentClientRowSchema = z
  .object({
    id: z.coerce.number().optional(),
    cid: z.coerce.number().optional(),
    client_id: z.string().nullable().optional(),
    pppoe_username: z.string().nullable().optional(),
    name: z.string(),
    phone: z.string().nullable().optional(),
    status: z.coerce.number().optional(),
    current_address: z.string().nullable().optional(),
    zone: RefSchema.nullable().optional(),
    network: RefSchema.nullable().optional(),
    package: RefSchema.nullable().optional(),
    billing_term: z.enum(["prepaid", "postpaid"]).nullable().optional(),
    payment_deadline: z.string().nullable().optional(),
    discount: z.string().nullable().optional(),
  })
  .passthrough();

export type SmsSentClientRow = z.infer<typeof SmsSentClientRowSchema>;

export const SmsSentFormSchema = z
  .object({
    phone: z.string().trim().optional().default(""),
    sms_template_id: NullableNumberSchema,
    client_ids: z.array(z.string()).nullable().optional(),
    sms_body: z
      .string({
        required_error: "sms_sent.sms_body.errors.required",
      })
      .trim()
      .min(1, { message: "sms_sent.sms_body.errors.required" }),
  })
  .superRefine((value, ctx) => {
    const hasTemplate = value.sms_template_id !== null && value.sms_template_id !== undefined;
    const phone = value.phone?.trim() ?? "";

    if (!hasTemplate && !phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "sms_sent.phone_number.errors.required",
      });
    }
  });

export type SmsSentFormInput = z.input<typeof SmsSentFormSchema>;
export type SmsSentFormValues = z.output<typeof SmsSentFormSchema>;

export const SmsSentClientStatusSchema = z.enum(["all", "active", "inactive"]);
export type SmsSentClientStatus = z.infer<typeof SmsSentClientStatusSchema>;

export const SmsSentClientFilterSchema = z.object({
  pppoe_username: z.string().trim().optional().default(""),
  name: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  network_id: NullableNumberSchema,
  zone_id: NullableNumberSchema,
  client_status: SmsSentClientStatusSchema.default("all"),
});

export type SmsSentClientFilterInput = z.input<typeof SmsSentClientFilterSchema>;
export type SmsSentClientFilterValues = z.output<typeof SmsSentClientFilterSchema>;

export const SmsSentPayloadSchema = z.object({
  phone: z.string().nullable().optional(),
  sms_body: z.string(),
  sms_template_id: z.coerce.number().nullable().optional(),
  message: z.string(),
  custom_message: z.string(),
  all_client: z.coerce.number().default(0),
  status: z.coerce.number().nullable().optional(),
  clientIds: z.array(z.union([z.string(), z.number()])).nullable().optional(),
  client_filter: z.record(z.union([z.string(), z.number()])).optional(),
  sms_count: z.coerce.number().optional(),
});

export type SmsSentPayload = z.output<typeof SmsSentPayloadSchema>;

export function buildSmsSentClientParams(
  filters: SmsSentClientFilterValues
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  const pppoeUsername = filters.pppoe_username?.trim();
  const name = filters.name?.trim();
  const phone = filters.phone?.trim();

  if (pppoeUsername) params.pppoe_username = pppoeUsername;
  if (name) params.name = name;
  if (phone) params.phone = phone;
  if (filters.network_id) params.network_id = filters.network_id;
  if (filters.zone_id) params.zone_id = filters.zone_id;
  if (filters.client_status === "active") params.status = 1;
  if (filters.client_status === "inactive") params.status = 0;

  return params;
}

type BuildPayloadOptions = {
  formValues: SmsSentFormValues;
  filterValues: SmsSentClientFilterValues;
  smsCount: number;
  selectedClientIds?: number[];
};

export function buildSmsSentPayload({
  formValues,
  filterValues,
  smsCount,
  selectedClientIds,
}: BuildPayloadOptions): SmsSentPayload {
  const hasTemplate =
    formValues.sms_template_id !== null && formValues.sms_template_id !== undefined;
  const phoneNumber = formValues.phone?.trim() || null;
  const smsBody = formValues.sms_body.trim();
  const clientFilter = buildSmsSentClientParams(filterValues);

  return {
    phone: phoneNumber,
    sms_body: smsBody,
    sms_template_id: formValues.sms_template_id ?? null,
    message: smsBody,
    custom_message: smsBody,
    all_client: hasTemplate && (!selectedClientIds || selectedClientIds.length === 0) ? 1 : 0,
    status:
      filterValues.client_status === "all"
        ? null
        : filterValues.client_status === "active"
          ? 1
          : 0,
    clientIds: selectedClientIds && selectedClientIds.length > 0 ? selectedClientIds : null,
    client_filter: hasTemplate ? clientFilter : undefined,
    sms_count: smsCount,
  };
}

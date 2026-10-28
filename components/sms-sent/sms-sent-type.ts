import { z } from "zod";
import { InvoiceDueItemSchema } from "@/components/clients/client-type";

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

export const SmsSendModeSchema = z.enum(["live", "test"]);

export type SmsSendMode = z.infer<typeof SmsSendModeSchema>;

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
    invoiceDue: z.array(InvoiceDueItemSchema).nullable().optional(),
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

const SmsSentStatusFilterSchema = z.preprocess((value) => {
  if (value === null || value === undefined || value === "" || value === "all") return "all";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}, z.union([z.literal("all"), z.literal(0), z.literal(1)]));

export const SmsSentClientFilterSchema = z.object({
  any: z.string().trim().optional().default(""),
  network_id: NullableNumberSchema,
  zone_id: NullableNumberSchema,
  status: SmsSentStatusFilterSchema.default("all"),
});

export type SmsSentClientFilterInput = z.input<typeof SmsSentClientFilterSchema>;
export type SmsSentClientFilterValues = z.output<typeof SmsSentClientFilterSchema>;

const INVOICE_DUE_TEMPLATE_TYPES = ["invoice_due", "invoice_due_reminder"] as const;

export function isInvoiceDueSmsTemplate(templateType: string | null | undefined): boolean {
  return (
    templateType === INVOICE_DUE_TEMPLATE_TYPES[0] ||
    templateType === INVOICE_DUE_TEMPLATE_TYPES[1]
  );
}

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
  mode: SmsSendModeSchema.default("live"),
  send_now: z.boolean().optional(),
});

export type SmsSentPayload = z.output<typeof SmsSentPayloadSchema>;

export const SmsSendQuoteSchema = z.object({
  recipients: z.number(),
  total_units: z.number(),
  total_cost: z.number(),
  balance: z.number().nullable(),
  remaining_balance: z.number().nullable(),
  sufficient: z.boolean(),
  scheduled_at: z.string().nullable(),
  timezone: z.string(),
});

export type SmsSendQuote = z.infer<typeof SmsSendQuoteSchema>;

/** Test sends are never charged, so only live sends need enough wallet balance. */
export function canConfirmSmsSend(quote: SmsSendQuote, mode: SmsSendMode): boolean {
  return quote.recipients > 0 && (mode === "test" || quote.sufficient);
}

export function buildSmsSentClientParams(
  filters: SmsSentClientFilterValues,
  options?: { invoiceDueOnly?: boolean }
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  const any = filters.any?.trim();

  if (any) params.any = any;
  if (filters.network_id) params.network_id = filters.network_id;
  if (filters.zone_id) params.zone_id = filters.zone_id;
  if (filters.status === 0 || filters.status === 1) params.status = filters.status;
  if (options?.invoiceDueOnly) params.invoice = "due";

  return params;
}

type BuildPayloadOptions = {
  formValues: SmsSentFormValues;
  filterValues: SmsSentClientFilterValues;
  smsCount: number;
  selectedClientIds?: (string | number)[];
  preferClientIdsForTemplate?: boolean;
  mode?: SmsSendMode;
};

export function buildSmsSentPayload({
  formValues,
  filterValues,
  smsCount,
  selectedClientIds,
  preferClientIdsForTemplate = false,
  mode = "live",
}: BuildPayloadOptions): SmsSentPayload {
  const hasTemplate =
    formValues.sms_template_id !== null && formValues.sms_template_id !== undefined;
  const shouldUseClientIdsForTemplate =
    preferClientIdsForTemplate && hasTemplate && !!selectedClientIds?.length;
  const phoneNumber = shouldUseClientIdsForTemplate ? null : formValues.phone?.trim() || null;
  const smsBody = formValues.sms_body.trim();
  const clientFilter = buildSmsSentClientParams(filterValues);

  return {
    phone: phoneNumber,
    sms_body: smsBody,
    sms_template_id: formValues.sms_template_id ?? null,
    message: smsBody,
    custom_message: smsBody,
    all_client: hasTemplate && (!selectedClientIds || selectedClientIds.length === 0) ? 1 : 0,
    status: filterValues.status === 0 || filterValues.status === 1 ? filterValues.status : null,
    clientIds: selectedClientIds && selectedClientIds.length > 0 ? selectedClientIds : null,
    client_filter: hasTemplate ? clientFilter : undefined,
    sms_count: smsCount,
    mode,
  };
}

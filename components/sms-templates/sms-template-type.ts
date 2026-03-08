import { z } from "zod";

export const SMS_TEMPLATE_TYPES = [
  "welcome",
  "invoice_due",
  "invoice_due_reseller",
  "payment_received",
  "wallet_payment",
  "client_activated",
  "client_deactivated",
  "invoice_due_reminder",
  "custom",
] as const;

export const SMS_TEMPLATE_TYPE_LABEL_KEYS: Record<
  SmsTemplateType,
  string
> = {
  welcome: "sms_template.template_type.options.welcome",
  invoice_due: "sms_template.template_type.options.invoice_due",
  invoice_due_reseller: "sms_template.template_type.options.invoice_due_reseller",
  payment_received: "sms_template.template_type.options.payment_received",
  wallet_payment: "sms_template.template_type.options.wallet_payment",
  client_activated: "sms_template.template_type.options.client_activated",
  client_deactivated: "sms_template.template_type.options.client_deactivated",
  invoice_due_reminder: "sms_template.template_type.options.invoice_due_reminder",
  custom: "sms_template.template_type.options.custom",
};

export type SmsTemplateType = (typeof SMS_TEMPLATE_TYPES)[number];

export const SmsTemplateTokenSchema = z.enum([
  "{{client_id}}",
  "{{client_name}}",
  "{{total_due}}",
  "{{deadline}}",
  "{{this_month}}",
  "{{password}}",
  "{{package}}",
  "{{day}}",
  "{{company_name}}",
  "{{company_phone}}",
  "{{invoice_type}}",
  "{{invoice_discount}}",
  "{{payment_link}}",
  "{{payment_amount}}",
  "{{payment_discount}}",
  "{{payment_Id}}",
  "{{fund}}",
  "{{reseller_name}}",
  "{{opening_balance}}",
  "{{closing_balance}}",
]);

export type SmsTemplateToken = z.infer<typeof SmsTemplateTokenSchema>;

export const SMS_TEMPLATE_TOKENS = SmsTemplateTokenSchema.options;

export const SmsTemplateRowSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  message: z.string().nullable().optional(),
  template_type: z.string(),
  deletable: z.coerce.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
}).passthrough();

export type SmsTemplateRow = z.infer<typeof SmsTemplateRowSchema>;

export const SmsTemplateFormSchema = z.object({
  name: z.string({
    required_error: "sms_template.name.errors.required",
    invalid_type_error: "sms_template.name.errors.invalid",
  }).min(2, { message: "sms_template.name.errors.min" }),
  message: z.string({
    required_error: "sms_template.message.errors.required",
    invalid_type_error: "sms_template.message.errors.invalid",
  }).min(1, { message: "sms_template.message.errors.required" }),
  template_type: z.enum(SMS_TEMPLATE_TYPES, {
    required_error: "sms_template.template_type.errors.required",
    invalid_type_error: "sms_template.template_type.errors.invalid",
  }),
});

export type SmsTemplateFormInput = z.input<typeof SmsTemplateFormSchema>;
export type SmsTemplatePayload = z.output<typeof SmsTemplateFormSchema>;

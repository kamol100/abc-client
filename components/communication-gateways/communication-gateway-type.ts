import { z } from "zod";

export const CHANNEL_TYPES = ["sms", "voice", "email", "whatsapp", "telegram"] as const;
export type ChannelType = (typeof CHANNEL_TYPES)[number];

export const STATUS_VALUES = ["active", "inactive", "test"] as const;
export type StatusValue = (typeof STATUS_VALUES)[number];

export const ACCESS_TYPE_VALUES = ["view", "edit", "delete"] as const;
export type AccessTypeValue = (typeof ACCESS_TYPE_VALUES)[number];

/** Row from API list/detail (table + edit hydration) */
export const CommunicationGatewayRowSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
    type: z.enum(CHANNEL_TYPES),
    api: z.string().nullable().optional(),
    balance_api: z.string().nullable().optional(),
    rates_per_unit: z.coerce.number().nullable().optional(),
    status: z.enum(STATUS_VALUES).optional(),
    access_type: z.enum(ACCESS_TYPE_VALUES).optional(),
    note: z.string().nullable().optional(),
    company_id: z.coerce.number().nullable().optional(),
    reseller_id: z.coerce.number().nullable().optional(),
    company: z.record(z.unknown()).nullable().optional(),
    reseller: z.record(z.unknown()).nullable().optional(),
    api_key: z.string().nullable().optional(),
    api_secret: z.string().nullable().optional(),
    api_token: z.string().nullable().optional(),
    api_username: z.string().nullable().optional(),
    api_password: z.string().nullable().optional(),
    api_host: z.string().nullable().optional(),
    api_port: z.string().nullable().optional(),
    campaign_id: z.string().nullable().optional(),
  })
  .passthrough();

export type CommunicationGatewayRow = z.infer<typeof CommunicationGatewayRowSchema>;

/** Form validation only (no id, no API response-only fields) */
export const CommunicationGatewayFormSchema = z
  .object({
    name: z
      .string({
        required_error: "communication_gateway.name.errors.required",
        invalid_type_error: "communication_gateway.name.errors.invalid",
      })
      .min(2, { message: "communication_gateway.name.errors.min" }),
    type: z.enum(CHANNEL_TYPES, {
      required_error: "communication_gateway.type.errors.required",
    }),
    api: z
      .string({
        required_error: "communication_gateway.api.errors.required",
      })
      .min(2, { message: "communication_gateway.api.errors.min" }),
    balance_api: z.string().nullable().optional(),
    rates_per_unit: z.coerce.number().nullable().optional(),
    status: z.enum(STATUS_VALUES).default("active"),
    access_type: z.enum(ACCESS_TYPE_VALUES).default("view"),
    note: z.string().nullable().optional(),
    company_id: z.coerce.number().nullable().optional(),
    reseller_id: z.coerce.number().nullable().optional(),
    api_key: z.string().nullable().optional(),
    api_secret: z.string().nullable().optional(),
    api_token: z.string().nullable().optional(),
    api_username: z.string().nullable().optional(),
    api_password: z.string().nullable().optional(),
    api_host: z.string().nullable().optional(),
    api_port: z.string().nullable().optional(),
    campaign_id: z.string().nullable().optional(),
  })
  .refine(
    (data) =>
      data.type !== "voice" ||
      (data.campaign_id != null && String(data.campaign_id).trim().length > 0),
    {
      message: "communication_gateway.campaign_id.errors.required_voice",
      path: ["campaign_id"],
    }
  );

export type CommunicationGatewayFormInput = z.input<typeof CommunicationGatewayFormSchema>;
export type CommunicationGatewayPayload = z.output<typeof CommunicationGatewayFormSchema>;

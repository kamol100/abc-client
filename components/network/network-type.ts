import i18n from "@/i18n";
import { z } from "zod";

export const NetworkRowSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
    ip_address: z.string().nullable().optional(),
    mikrotik_user: z.string().nullable().optional(),
    mikrotik_password: z.string().nullable().optional(),
    auto_client_mikrotik_status: z.coerce.number().optional(),
    auto_sync_status: z.coerce.number().optional(),
    graph_status: z.coerce.number().optional(),
    web_port: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    status: z.coerce.number().optional(),
    deletable: z.coerce.number().optional(),
  })
  .passthrough();

export type NetworkRow = z.infer<typeof NetworkRowSchema>;

export const NetworkFormSchema = z.object({
  name: z
    .string({
      required_error: i18n.t("network.name.errors.required"),
      invalid_type_error: i18n.t("network.name.errors.invalid"),
    })
    .min(2, { message: i18n.t("network.name.errors.min") }),
  ip_address: z
    .string({
      required_error: i18n.t("network.ip_address.errors.required"),
      invalid_type_error: i18n.t("network.ip_address.errors.invalid"),
    })
    .min(5, { message: i18n.t("network.ip_address.errors.min") }),
  mikrotik_user: z
    .string({
      required_error: i18n.t("network.mikrotik_user.errors.required"),
      invalid_type_error: i18n.t("network.mikrotik_user.errors.invalid"),
    })
    .min(2, { message: i18n.t("network.mikrotik_user.errors.min") }),
  mikrotik_password: z
    .string({
      invalid_type_error: i18n.t("network.mikrotik_password.errors.invalid"),
    })
    .min(5, { message: i18n.t("network.mikrotik_password.errors.min") })
    .optional()
    .or(z.literal("")),
  web_port: z.string().optional().nullable(),
  auto_client_mikrotik_status: z.coerce.number().min(0).max(1),
  auto_sync_status: z.coerce.number().min(0).max(1),
  graph_status: z.coerce.number().min(0).max(1),
  notes: z.string().optional().nullable(),
});

export type NetworkFormInput = z.input<typeof NetworkFormSchema>;
export type NetworkPayload = z.output<typeof NetworkFormSchema>;

import { z } from "zod";

export const NetworkRefSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
  })
  .passthrough();

export const MIKROTIK_COMMANDS = [
  "/ip/address/print",
  "/ppp/profile/print",
  "/ppp/secret/print",
  "/ppp/active/print",
] as const;

export const MikrotikCommandOptions = MIKROTIK_COMMANDS.map((command) => ({
  value: command,
  label: command,
}));

export const MikrotikCommandRowSchema = z
  .object({
    id: z.coerce.number(),
    key: z.string(),
    value: z.string(),
  })
  .passthrough();

export const MikrotikCommandFormSchema = z.object({
  network_id: z.coerce
    .number({
      required_error: "mikrotik_command.network.errors.required",
      invalid_type_error: "mikrotik_command.network.errors.required",
    })
    .min(1, { message: "mikrotik_command.network.errors.required" }),
  command: z
    .string({
      required_error: "mikrotik_command.command.errors.required",
      invalid_type_error: "mikrotik_command.command.errors.required",
    })
    .min(1, { message: "mikrotik_command.command.errors.required" }),
});

export type MikrotikCommandRow = z.infer<typeof MikrotikCommandRowSchema>;
export type MikrotikCommandFormInput = z.input<typeof MikrotikCommandFormSchema>;
export type MikrotikCommandPayload = z.output<typeof MikrotikCommandFormSchema>;

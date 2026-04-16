import { z } from "zod";

export const ClientLoginSchema = z.object({
  api: z.string(),
  phone: z.string().min(1, { message: "client_login.phone.errors.required" }),
  password: z
    .string({ required_error: "client_login.password.errors.required" })
    .min(2, { message: "client_login.password.errors.min_length" }),
});

export type ClientLogin = z.infer<typeof ClientLoginSchema>;

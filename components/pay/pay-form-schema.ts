import { z } from "zod";

export const PayFormSchema = z.object({
  phone: z
    .string({ required_error: "pay.phone.errors.required" })
    .min(1, { message: "pay.phone.errors.required" }),
  captcha: z
    .string({ required_error: "pay.captcha.errors.required" })
    .min(1, { message: "pay.captcha.errors.required" }),
});

export type PayFormInput = z.infer<typeof PayFormSchema>;

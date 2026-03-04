import { z } from "zod";
import i18n from "@/i18n";

export const SmsSendSchema = z.object({
    phone: z.string({
        required_error: i18n.t("sms_send.phone.errors.required"),
    }).min(1, { message: i18n.t("sms_send.phone.errors.required") }),
    message: z.string({
        required_error: i18n.t("sms_send.message.errors.required"),
    }).min(2, { message: i18n.t("sms_send.message.errors.min") }),
    sms_template_id: z.coerce.number().nullable().optional(),
});

export type SmsSendInput = z.input<typeof SmsSendSchema>;
export type SmsSendPayload = z.output<typeof SmsSendSchema>;

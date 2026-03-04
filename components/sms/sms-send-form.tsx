"use client";

import { FC, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/components/action-button";
import SelectDropdown from "@/components/select-dropdown";
import Label from "@/components/label";
import useApiMutation from "@/hooks/use-api-mutation";
import { SmsSendSchema, SmsSendInput, SmsSendPayload } from "./sms-send-type";

interface SmsSendFormProps {
    phone?: string;
}

const SmsSendForm: FC<SmsSendFormProps> = ({ phone }) => {
    const { t } = useTranslation();

    const form = useForm<SmsSendInput>({
        resolver: zodResolver(SmsSendSchema),
        defaultValues: {
            phone: phone ?? "",
            message: "",
            sms_template_id: null,
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = form;

    useEffect(() => {
        if (phone) setValue("phone", phone);
    }, [phone, setValue]);

    const { mutateAsync, isPending } = useApiMutation<unknown, SmsSendPayload>({
        url: "sms-store",
        method: "POST",
        successMessage: "sms_send.success",
    });

    const onSubmit = async (data: SmsSendInput) => {
        await mutateAsync(data as SmsSendPayload);
        reset({ phone: "", message: "", sms_template_id: null });
    };

    return (
        <div className="flex items-center justify-center py-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>{t("sms_send.title")}</CardTitle>
                    {phone && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                                {t("sms_send.phone_prefilled")}
                            </span>
                            <Badge variant="secondary">{phone}</Badge>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <FormProvider {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label label={{
                                    labelText: t("sms_send.phone.label"),
                                    mandatory: true,
                                }} />
                                <input
                                    {...register("phone")}
                                    placeholder={t("sms_send.phone.placeholder")}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <SelectDropdown
                                name="sms_template_id"
                                label={{ labelText: t("sms_send.template.label") }}
                                api="/dropdown-sms-templates"
                                placeholder="sms_send.template.placeholder"
                                isClearable
                            />

                            <div>
                                <Label label={{
                                    labelText: t("sms_send.message.label"),
                                    mandatory: true,
                                }} />
                                <textarea
                                    {...register("message")}
                                    placeholder={t("sms_send.message.placeholder")}
                                    rows={4}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.message && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.message.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <ActionButton
                                    action="save"
                                    type="submit"
                                    variant="default"
                                    size="default"
                                    loading={isPending}
                                    title={t("sms_send.send")}
                                />
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
};

export default SmsSendForm;

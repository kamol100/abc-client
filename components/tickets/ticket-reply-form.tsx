"use client";

import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import useApiMutation from "@/hooks/use-api-mutation";
import { TicketReplySchema, TicketReplyInput } from "./ticket-type";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Card from "../card";
import { usePermissions } from "@/context/app-provider";
import TextareaField from "@/components/form/textarea-field";
import { Form } from "@/components/ui/form";

interface TicketReplyFormProps {
    ticketId: string;
}

const TicketReplyForm: FC<TicketReplyFormProps> = ({ ticketId }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    const form = useForm<TicketReplyInput>({
        resolver: zodResolver(TicketReplySchema),
        defaultValues: { message: "" },
    });
    const { handleSubmit, reset } = form;

    const { mutateAsync, isPending } = useApiMutation<unknown, TicketReplyInput>({
        url: `tickets/${ticketId}/messages`,
        method: "POST",
        invalidateKeys: "ticket-messages",
        successMessage: "ticket.reply.success",
    });

    const onSubmit = async (data: TicketReplyInput) => {
        await mutateAsync(data);
        reset();
    };

    if (!hasPermission("tickets.reply") && !hasPermission("tickets.access")) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("ticket.reply.title")}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <TextareaField
                            name="message"
                            label={{
                                labelText: "ticket.reply.title",
                                mandatory: true,
                            }}
                            placeholder="ticket.reply.placeholder"
                            rows={3}
                        />
                        <div className="flex justify-end">
                            <MyButton
                                action="save"
                                type="submit"
                                variant="default"
                                size="default"
                                loading={isPending}
                                title={t("ticket.reply.send")}
                            />
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default TicketReplyForm;

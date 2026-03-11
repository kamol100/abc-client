"use client";

import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import ActionButton from "@/components/action-button";
import useApiMutation from "@/hooks/use-api-mutation";
import { TicketReplySchema, TicketReplyInput } from "./ticket-type";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Card from "../card";
import { usePermissions } from "@/context/app-provider";

interface TicketReplyFormProps {
    ticketId: string;
}

const TicketReplyForm: FC<TicketReplyFormProps> = ({ ticketId }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TicketReplyInput>({
        resolver: zodResolver(TicketReplySchema),
        defaultValues: { message: "" },
    });

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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div>
                        <textarea
                            {...register("message")}
                            placeholder={t("ticket.reply.placeholder")}
                            rows={3}
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
                            title={t("ticket.reply.send")}
                        />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default TicketReplyForm;

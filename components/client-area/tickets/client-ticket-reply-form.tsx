"use client";

import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import useApiMutation from "@/hooks/use-api-mutation";
import {
  TicketReplySchema,
  TicketReplyInput,
} from "@/components/tickets/ticket-type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextareaField from "@/components/form/textarea-field";
import { Form } from "@/components/ui/form";

interface Props {
  ticketId: string;
}

const ClientTicketReplyForm: FC<Props> = ({ ticketId }) => {
  const { t } = useTranslation();

  const form = useForm<TicketReplyInput>({
    resolver: zodResolver(TicketReplySchema),
    defaultValues: { message: "" },
  });
  const { handleSubmit, reset } = form;

  const { mutateAsync, isPending } = useApiMutation<unknown, TicketReplyInput>({
    url: `client-tickets/${ticketId}/messages`,
    method: "POST",
    invalidateKeys: "client-ticket-messages",
    successMessage: "ticket.reply.success",
  });

  const onSubmit = async (data: TicketReplyInput) => {
    await mutateAsync(data);
    reset();
  };

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

export default ClientTicketReplyForm;

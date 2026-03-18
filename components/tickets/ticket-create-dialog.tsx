"use client";

import { FC, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MyDialog, useMyDialogClose } from "@/components/my-dialog";
import FormTrigger from "@/components/form-trigger";
import ActionButton from "@/components/action-button";
import SelectDropdown from "@/components/select-dropdown";
import Label from "@/components/label";
import useApiMutation from "@/hooks/use-api-mutation";
import { usePermissions } from "@/context/app-provider";
import {
    TicketCreateSchema,
    TicketCreateInput,
    TicketCreatePayload,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
} from "./ticket-type";

const TicketCreateDialog: FC = () => {
    const { hasPermission } = usePermissions();

    if (!hasPermission("tickets.create")) return null;

    return (
        <MyDialog
            size="xl"
            title="ticket.create_title"
            trigger={<FormTrigger mode="create" />}
        >
            <TicketCreateForm />
        </MyDialog>
    );
};

const TicketCreateForm: FC = () => {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const clientId = searchParams.get("client_id");
    const close = useMyDialogClose();

    const form = useForm<TicketCreateInput>({
        resolver: zodResolver(TicketCreateSchema),
        defaultValues: {
            client_id: clientId ? Number(clientId) : undefined,
            priority: "medium",
            status: "open",
            message: "",
            tag_id: [],
        },
    });

    const { handleSubmit, reset, setValue } = form;

    useEffect(() => {
        if (clientId) {
            setValue("client_id", Number(clientId));
        }
    }, [clientId, setValue]);

    const { mutateAsync, isPending } = useApiMutation<unknown, TicketCreatePayload>({
        url: "tickets",
        method: "POST",
        invalidateKeys: "tickets",
        successMessage: "ticket.create_success",
    });

    const onSubmit = async (data: TicketCreateInput) => {
        await mutateAsync(data as TicketCreatePayload);
        reset();
        close?.();
    };

    const priorityOptions = PRIORITY_OPTIONS.map((o) => ({
        value: o.value,
        label: t(o.label),
    }));

    const statusOptions = STATUS_OPTIONS.map((o) => ({
        value: o.value,
        label: t(o.label),
    }));

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectDropdown
                        name="client_id"
                        label={{
                            labelText: t("ticket.client.label"),
                            mandatory: true,
                        }}
                        api="/dropdown-clients"
                        placeholder="ticket.client.placeholder"
                    />
                    <SelectDropdown
                        name="subject_id"
                        label={{
                            labelText: t("ticket.subject.label"),
                            mandatory: true,
                        }}
                        api="/dropdown-subjects"
                        placeholder="ticket.subject.placeholder"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectDropdown
                        name="tag_id"
                        label={{ labelText: t("ticket.tags.label") }}
                        api="/dropdown-tags"
                        isMulti
                        placeholder="ticket.tags.placeholder"
                    />
                    <SelectDropdown
                        name="assigned_to"
                        label={{ labelText: t("ticket.assigned_to.label") }}
                        api="/dropdown-staffs"
                        placeholder="ticket.assigned_to.placeholder"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectDropdown
                        name="priority"
                        label={{ labelText: t("ticket.priority.label") }}
                        options={priorityOptions}
                        isClearable={false}
                        placeholder="ticket.priority.label"
                    />
                    <SelectDropdown
                        name="status"
                        label={{ labelText: t("ticket.status.label") }}
                        options={statusOptions}
                        isClearable={false}
                        placeholder="ticket.status.label"
                    />
                </div>

                <div>
                    <Label label={{ labelText: t("ticket.message.label"), mandatory: true }} />
                    <textarea
                        {...form.register("message")}
                        placeholder={t("ticket.message.placeholder")}
                        rows={4}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {form.formState.errors.message && (
                        <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.message.message}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <ActionButton
                        action="save"
                        type="submit"
                        variant="default"
                        size="default"
                        loading={isPending}
                        title={t("common.save")}
                    />
                </div>
            </form>
        </FormProvider>
    );
};

export default TicketCreateDialog;

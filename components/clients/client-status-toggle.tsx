"use client";

import DatePicker from "@/components/form/DatePicker";
import { MyDialog } from "@/components/my-dialog";
import MyButton from "@/components/my-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useApiMutation from "@/hooks/use-api-mutation";
import { formatMoney } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useRef, useState } from "react";
import { Controller, FormProvider, Resolver, useForm, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    ActivationInvoicePayload,
    ActivationInvoicePreview,
    ActivationInvoiceSchema,
    activationAmountsMatch,
    activationPreview,
} from "@/components/clients/client-activation";

interface ClientStatusToggleProps {
    clientId: string;
    initialStatus: 0 | 1;
}

const DEADLINE_DAYS = Array.from({ length: 30 }, (_, index) => String(index + 1));

const amountFieldValue = (amount: number): string =>
    Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

type ActivationFormValues = {
    amount: string;
    payment_deadline: string;
    termination_date: string | null;
    note: string;
};

const ClientActivationDialog: FC<{
    preview: ActivationInvoicePreview;
    pending: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ActivationInvoicePayload) => void;
}> = ({ preview, pending, onOpenChange, onSubmit }) => {
    const { t } = useTranslation();
    const form = useForm<ActivationFormValues>({
        // Form fields stay text. The schema coerces them when the bill is submitted.
        resolver: zodResolver(ActivationInvoiceSchema) as unknown as Resolver<ActivationFormValues>,
        defaultValues: {
            amount: amountFieldValue(preview.adjust_amount),
            payment_deadline: String(preview.payment_deadline),
            termination_date: preview.termination_date,
            note: "",
        },
    });

    const summary = [
        preview.pppoe_username,
        preview.client_name,
        preview.package_name,
        `৳${formatMoney(preview.package_price, 2)}`,
    ].filter((part) => part !== null && part !== "").join(" | ");

    return (
        <MyDialog
            open
            onOpenChange={onOpenChange}
            size="xl"
            title="client.activation.title"
            description="client.activation.description"
            loading={pending}
            showFooter
            footer={({ close, loading }) => (
                <>
                    <MyButton type="button" variant="outline" action="cancel" onClick={close} disabled={loading}>
                        {t("common.cancel")}
                    </MyButton>
                    <MyButton
                        type="submit"
                        form="client-activation-invoice"
                        action="save"
                        loading={loading}
                        disabled={loading}
                    >
                        {t("client.activation.submit")}
                    </MyButton>
                </>
            )}
        >
            <FormProvider {...form}>
                <form
                    id="client-activation-invoice"
                    className="grid grid-cols-1 gap-3 pb-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-start sm:gap-x-4 sm:gap-y-4"
                    onSubmit={form.handleSubmit((values) => onSubmit(ActivationInvoiceSchema.parse(values)))}
                >
                    <FieldLabel>{t("client.activation.client_info")}</FieldLabel>
                    <p className="text-sm font-semibold text-foreground">{summary}</p>

                    <FieldLabel>{t("client.activation.generate_date")}</FieldLabel>
                    <p className="text-sm font-semibold text-foreground">{preview.create_date_label}</p>

                    <FieldLabel htmlFor="activation-amount" required>
                        {t("client.activation.adjust", { month: preview.month_label })}
                    </FieldLabel>
                    <AdjustAmount preview={preview} />

                    <FieldLabel htmlFor="activation-deadline" required>
                        {t("client.activation.deadline_label")}
                    </FieldLabel>
                    <DeadlineField />

                    <FieldLabel>{t("client.activation.termination_date")}</FieldLabel>
                    <DatePicker
                        name="termination_date"
                        placeholder="client.activation.termination_placeholder"
                        clearable
                        dateFormat="yyyy-MM-dd"
                    />

                    <FieldLabel htmlFor="activation-note" required>
                        {t("client.activation.note_label")}
                    </FieldLabel>
                    <NoteField />
                </form>
            </FormProvider>
        </MyDialog>
    );
};

const FieldLabel: FC<{ children: string; htmlFor?: string; required?: boolean }> = ({
    children,
    htmlFor,
    required = false,
}) => (
    <label htmlFor={htmlFor} className="pt-2 text-sm text-muted-foreground sm:pt-2">
        {children}
        {required ? <span className="text-destructive"> *</span> : null}
    </label>
);

const AdjustAmount: FC<{ preview: ActivationInvoicePreview }> = ({ preview }) => {
    const { t } = useTranslation();
    const { control, watch, formState: { errors } } = useFormContext();
    const entered = Number(watch("amount"));
    const edited = Number.isFinite(entered) && !activationAmountsMatch(entered, preview.adjust_amount);

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                        <Input
                            id="activation-amount"
                            inputMode="decimal"
                            className="w-28"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                        />
                    )}
                />
                <span className="inline-flex h-9 items-center rounded-md bg-muted px-3 text-sm font-medium text-destructive">
                    {t("client.activation.remaining_days", { count: preview.remaining_days })}
                </span>
            </div>
            <p className={cn("text-xs", edited ? "font-medium text-foreground" : "text-muted-foreground")}>
                {t(edited ? "client.activation.amount_edited" : "client.activation.amount_calculated")}
            </p>
            {errors.amount?.message ? (
                <p className="text-sm text-destructive">{t(String(errors.amount.message))}</p>
            ) : null}
        </div>
    );
};

const DeadlineField: FC = () => {
    const { t } = useTranslation();
    const { control, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-1">
            <Controller
                name="payment_deadline"
                control={control}
                render={({ field }) => (
                    <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
                        <SelectTrigger id="activation-deadline" className="w-24" aria-label={t("client.activation.deadline_label")}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DEADLINE_DAYS.map((day) => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.payment_deadline?.message ? (
                <p className="text-sm text-destructive">{t(String(errors.payment_deadline.message))}</p>
            ) : null}
        </div>
    );
};

const NoteField: FC = () => {
    const { t } = useTranslation();
    const { control, formState: { errors } } = useFormContext();

    return (
        <div className="space-y-1">
            <Controller
                name="note"
                control={control}
                render={({ field }) => (
                    <Textarea
                        id="activation-note"
                        rows={3}
                        placeholder={t("client.activation.note_placeholder")}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                    />
                )}
            />
            {errors.note?.message ? (
                <p className="text-sm text-destructive">{t(String(errors.note.message))}</p>
            ) : null}
        </div>
    );
};

const ClientStatusToggle: FC<ClientStatusToggleProps> = ({ clientId, initialStatus }) => {
    const [status, setStatus] = useState(initialStatus);
    const [preview, setPreview] = useState<ActivationInvoicePreview | null>(null);
    const submitLock = useRef(false);

    const { mutate, isPending } = useApiMutation<unknown, { status: 0 | 1; invoice?: ActivationInvoicePayload }>({
        url: `/client-status/${clientId}`,
        method: "PUT",
        invalidateKeys: "clients",
        successMessage: "client.status_updated",
        ignoreError: (error) => activationPreview(error) !== null,
        onSuccess: () => {
            setStatus((current) => (current === 1 ? 0 : 1));
            setPreview(null);
        },
        onError: (error) => {
            const next = activationPreview(error);
            if (next) setPreview(next);
        },
    });

    const requestStatus = (next: 0 | 1, invoice?: ActivationInvoicePayload) => {
        if (submitLock.current || isPending) return;
        submitLock.current = true;
        mutate(
            invoice ? { status: next, invoice } : { status: next },
            { onSettled: () => { submitLock.current = false; } },
        );
    };

    return (
        <>
            <Switch
                checked={status === 1}
                onCheckedChange={() => requestStatus(status === 1 ? 0 : 1)}
                disabled={isPending || preview !== null}
            />
            {preview ? (
                <ClientActivationDialog
                    preview={preview}
                    pending={isPending}
                    onOpenChange={(open) => {
                        if (!open && !isPending) setPreview(null);
                    }}
                    onSubmit={(values) => requestStatus(1, values)}
                />
            ) : null}
        </>
    );
};

export default ClientStatusToggle;

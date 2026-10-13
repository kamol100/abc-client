"use client";

import { useTranslation } from "react-i18next";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
import { MyDialog, useMyDialogClose } from "@/components/my-dialog";
import useApiMutation from "@/hooks/use-api-mutation";
import { onuIdentity, onuLabel, type OnuRow } from "./onu-type";

// Every binding change can move a client between ONUs: refresh the ONU lists, client pages and OLT pages.
const INVALIDATE_KEYS = "onus,clients,olts,olt-clients";

export const OnuBindSchema = z.object({
    client_id: z.coerce
        .number({ required_error: "onu.bind.errors.client", invalid_type_error: "onu.bind.errors.client" })
        .int()
        .positive({ message: "onu.bind.errors.client" }),
});

const BIND_FIELDS: FieldConfig[] = [
    {
        type: "dropdown",
        name: "client_id",
        label: { labelText: "onu.bind.client", mandatory: true },
        placeholder: "onu.bind.client_placeholder",
        api: "/dropdown-clients",
    },
];

type BindingOnu = Pick<OnuRow, "id" | "name" | "label" | "serial" | "mac" | "client" | "client_bound" | "client_binding">;

/** Unbind / back to automatic: the same PUT /onus/{id}; inside the dialog so it can close it. */
function BindExtraActions({ onu }: { onu: BindingOnu }) {
    const { t } = useTranslation();
    const close = useMyDialogClose();
    const options = {
        url: `/onus/${onu.id}`,
        method: "PUT" as const,
        invalidateKeys: INVALIDATE_KEYS,
        successMessage: "onu.bind.saved",
        onSuccess: () => close?.(),
    };
    const unbind = useApiMutation<unknown, { client_id: null }>(options);
    const auto = useApiMutation<unknown, { client_binding: "auto" }>(options);
    const bound = onu.client_bound ?? !!onu.client;
    const busy = unbind.isPending || auto.isPending;

    return (
        <div className="mt-4 flex flex-col gap-2 border-t pt-4">
            <div className="flex flex-wrap gap-2">
                {bound && (
                    <MyButton
                        type="button"
                        variant="outline"
                        className="text-destructive"
                        loading={unbind.isPending}
                        disabled={busy}
                        onClick={() => unbind.mutate({ client_id: null })}
                    >
                        {t("onu.bind.unbind")}
                    </MyButton>
                )}
                {onu.client_binding !== "auto" && (
                    <MyButton
                        type="button"
                        variant="outline"
                        loading={auto.isPending}
                        disabled={busy}
                        onClick={() => auto.mutate({ client_binding: "auto" })}
                    >
                        {t("onu.bind.auto")}
                    </MyButton>
                )}
            </div>
            <p className="text-xs text-muted-foreground">{t("onu.bind.auto_help")}</p>
        </div>
    );
}

interface Props {
    onu: BindingOnu;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Bind an ONU to a client (PUT /onus/{id} {client_id}), unbind it, or hand it back to automatic binding. */
export default function OnuBindDialog({ onu, open, onOpenChange }: Props) {
    const { t } = useTranslation();
    const identity = onuIdentity(onu);
    const bindingKey = onu.client_binding ?? (onu.client ? "auto" : null);

    return (
        <MyDialog
            size="xl"
            title="onu.bind.title"
            titleValues={{ name: onuLabel(onu) }}
            open={open}
            onOpenChange={onOpenChange}
        >
            <div className="mb-4 flex flex-col gap-1 rounded-md border bg-muted/40 p-3 text-sm">
                {identity && <span className="font-mono text-xs text-muted-foreground">{identity}</span>}
                <span>
                    <span className="text-muted-foreground">{t("onu.bind.current")}:</span>{" "}
                    {onu.client ? (
                        <strong>{onu.client.name}</strong>
                    ) : (
                        <span>{t(onu.client_bound ? "onu.bound_hidden" : "onu.unbound")}</span>
                    )}
                    {onu.client && bindingKey && (
                        <span className="text-muted-foreground"> · {t(`onu.binding.${bindingKey}`)}</span>
                    )}
                </span>
            </div>
            <FormBuilder
                formSchema={BIND_FIELDS}
                schema={OnuBindSchema}
                api={`/onus/${onu.id}`}
                // "create" sends to `api` itself (no /{id} suffix, no edit hydration); method makes it a PUT.
                method="PUT"
                mode="create"
                queryKey={INVALIDATE_KEYS}
                successMessage="onu.bind.saved"
                submitTitle={t("onu.bind.save")}
            />
            <BindExtraActions onu={onu} />
        </MyDialog>
    );
}

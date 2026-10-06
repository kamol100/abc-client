"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";
import Switch from "@/components/form/switch";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { MyDialog } from "@/components/my-dialog";
import { ResellerRow } from "@/components/resellers/reseller-type";
import {
    normalizeSettingValueForForm,
    SettingsApiResponse,
    SettingsPayloadSchema,
    toSettingsPayloadValue,
} from "@/components/settings/settings-type";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery from "@/hooks/use-api-query";

const SETTING_KEY = "auto_inactive_reseller_client_termination_date" as const;

const ResellerSettingsFormSchema = z.object({
    [SETTING_KEY]: z.boolean(),
});

type ResellerSettingsFormInput = z.infer<typeof ResellerSettingsFormSchema>;

const resellerSettingsFormSchema: FormFieldConfig[] = [
    { type: "switch", name: SETTING_KEY },
];

type ResellerSettingsDialogProps = {
    reseller: Pick<ResellerRow, "id" | "name">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type SettingFieldProps = {
    value: boolean;
    pending: boolean;
    onCommit: (nextValue: boolean) => Promise<boolean>;
};

const ResellerSettingField: FC<SettingFieldProps> = ({ value, pending, onCommit }) => {
    const { t } = useTranslation();
    const { setValue, reset } = useFormContext<ResellerSettingsFormInput>();

    useEffect(() => {
        reset({ [SETTING_KEY]: value });
    }, [reset, value]);

    const onValueChange = async (checked: boolean) => {
        const success = await onCommit(checked);
        if (!success) {
            setValue(SETTING_KEY, value, { shouldDirty: false });
        }
    };

    return (
        <div className="rounded-md border p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">
                    {t(`settings.fields.${SETTING_KEY}.label`)}
                </p>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm text-muted-foreground">
                        {value ? t("common.active") : t("common.inactive")}
                    </span>
                    <div className="flex items-center gap-2">
                        {pending && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <Switch
                            name={SETTING_KEY}
                            className="justify-end"
                            disabled={pending}
                            onValueChange={(checked) => void onValueChange(checked)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ResellerSettingsDialog: FC<ResellerSettingsDialogProps> = ({
    reseller,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const resellerUuid = reseller.id ?? "";
    const { data: settingsResponse, isLoading } = useApiQuery<SettingsApiResponse>({
        queryKey: ["settings", "reseller", resellerUuid],
        url: "company/settings",
        params: { reseller_uuid: resellerUuid },
        pagination: false,
        enabled: open && resellerUuid !== "",
    });
    const remoteSettings = settingsResponse?.data?.settings as Record<string, unknown> | undefined;
    const remoteValue = Boolean(
        normalizeSettingValueForForm(SETTING_KEY, remoteSettings?.[SETTING_KEY])
    );
    const [syncedValue, setSyncedValue] = useState(false);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!settingsResponse) return;
        setSyncedValue(remoteValue);
    }, [remoteValue, settingsResponse]);

    const { mutateAsync } = useApiMutation<
        unknown,
        { reseller_uuid: string; settings: Record<string, string | number | null> }
    >({
        url: "/company/settings",
        method: "POST",
        invalidateKeys: "settings",
    });

    const commitSetting = useCallback(
        async (nextValue: boolean) => {
            if (!resellerUuid) return false;

            const payloadValue = toSettingsPayloadValue(SETTING_KEY, nextValue);
            const payload = {
                reseller_uuid: resellerUuid,
                ...SettingsPayloadSchema.parse({
                    settings: {
                        [SETTING_KEY]: payloadValue,
                    },
                }),
            };

            setPending(true);
            try {
                await mutateAsync(payload);
                setSyncedValue(nextValue);
                toast.success(t("settings.messages.updated"));
                return true;
            } catch {
                return false;
            } finally {
                setPending(false);
            }
        },
        [mutateAsync, resellerUuid, t]
    );

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            size="md"
            title="reseller.settings.title"
        >
            <div className="space-y-4">
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    <p className="font-medium">{reseller.name}</p>
                </div>
                {open ? (
                    <FormBuilder
                        key={String(reseller.id ?? reseller.name)}
                        formSchema={resellerSettingsFormSchema}
                        grids={1}
                        data={{ [SETTING_KEY]: syncedValue }}
                        api="/company/settings"
                        mode="create"
                        schema={ResellerSettingsFormSchema}
                        method="POST"
                        queryKey="settings"
                        actionButton={false}
                    >
                        {() => (
                            <ResellerSettingField
                                value={syncedValue}
                                pending={pending || isLoading}
                                onCommit={commitSetting}
                            />
                        )}
                    </FormBuilder>
                ) : null}
            </div>
        </MyDialog>
    );
};

export default ResellerSettingsDialog;

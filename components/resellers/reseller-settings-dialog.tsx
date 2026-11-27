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
    clientAutoInactiveTimeSetting,
    readSetting,
    SettingsPayloadSchema,
    toPayload,
    type SettingsApiResponse,
} from "@/components/settings/core/values";
import type { SettingValue } from "@/components/settings/registry/define";
import { fieldOf } from "@/components/settings/registry/fields";
import { SettingControl } from "@/components/settings/ui/setting-controls";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery from "@/hooks/use-api-query";

const SETTING_KEY = "auto_inactive_reseller_client_termination_date" as const;
/** Hour of day (00–23) when the reseller's clients are made inactive. Same key as the company setting. */
const TIME_KEY = "auto_inactive_client_time" as const;
type ResellerSettingKey = typeof SETTING_KEY | typeof TIME_KEY;

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
        readSetting(SETTING_KEY, remoteSettings?.[SETTING_KEY])
    );
    const remoteHour = clientAutoInactiveTimeSetting(remoteSettings?.[TIME_KEY]);
    const [syncedValue, setSyncedValue] = useState(false);
    const [syncedHour, setSyncedHour] = useState<number>(remoteHour);
    const [pending, setPending] = useState(false);
    const [hourPending, setHourPending] = useState(false);

    useEffect(() => {
        if (!settingsResponse) return;
        setSyncedValue(remoteValue);
        setSyncedHour(remoteHour);
    }, [remoteHour, remoteValue, settingsResponse]);

    const { mutateAsync } = useApiMutation<
        unknown,
        { reseller_uuid: string; settings: Record<string, string | number | null> }
    >({
        url: "/company/settings",
        method: "POST",
        invalidateKeys: "settings",
    });

    const saveSetting = useCallback(
        async (key: ResellerSettingKey, nextValue: SettingValue) => {
            if (!resellerUuid) return false;

            const payload = {
                reseller_uuid: resellerUuid,
                ...SettingsPayloadSchema.parse({
                    settings: {
                        [key]: toPayload(key, nextValue),
                    },
                }),
            };

            try {
                await mutateAsync(payload);
                toast.success(t("settings.messages.updated"));
                return true;
            } catch {
                return false;
            }
        },
        [mutateAsync, resellerUuid, t]
    );

    const commitSetting = useCallback(
        async (nextValue: boolean) => {
            setPending(true);
            try {
                const saved = await saveSetting(SETTING_KEY, nextValue);
                if (saved) setSyncedValue(nextValue);
                return saved;
            } finally {
                setPending(false);
            }
        },
        [saveSetting]
    );

    const commitHour = useCallback(
        async (nextValue: SettingValue) => {
            setHourPending(true);
            try {
                const saved = await saveSetting(TIME_KEY, nextValue);
                if (saved) setSyncedHour(clientAutoInactiveTimeSetting(nextValue));
                return saved;
            } finally {
                setHourPending(false);
            }
        },
        [saveSetting]
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
                <div className="rounded-md border p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium">
                            {t(`settings.fields.${TIME_KEY}.label`)}
                        </p>
                        {/* Always shown, so the dialog keeps its height; it only applies while the switch is on. */}
                        <SettingControl
                            settingKey={TIME_KEY}
                            field={fieldOf(TIME_KEY)}
                            value={syncedHour}
                            saving={hourPending}
                            disabled={isLoading || pending || !syncedValue}
                            save={commitHour}
                        />
                    </div>
                </div>
            </div>
        </MyDialog>
    );
};

export default ResellerSettingsDialog;

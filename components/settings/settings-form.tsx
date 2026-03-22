"use client";

import MyButton from "@/components/my-button";
import Switch from "@/components/form/switch";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import SelectDropdown from "@/components/select-dropdown";
import { useSettings } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { Loader2 } from "lucide-react";
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
    buildSettingsFormSchema,
    SETTINGS_SECTION_SCHEMA,
    type SettingsFieldSchema,
    type SettingsSectionKey,
} from "./settings-form-schema";
import {
    normalizeSettingsForForm,
    normalizeSettingValueForForm,
    SettingsFormInput,
    SettingsFormSchema,
    type SettingsFieldKey,
    type SettingsPayload,
    SettingsPayloadSchema,
    toSettingsPayloadValue,
} from "./settings-type";

type SettingsFormProps = {
    section: SettingsSectionKey;
};

type CommitFieldHandler = (
    key: SettingsFieldKey,
    value: SettingsFormInput[SettingsFieldKey]
) => Promise<boolean>;

type SectionContentProps = {
    section: SettingsSectionKey;
    sectionFields: SettingsFieldSchema[];
    formFieldsMap: Map<string, FormFieldConfig>;
    syncedValues: SettingsFormInput;
    pendingKeys: Set<SettingsFieldKey>;
    commitField: CommitFieldHandler;
    renderField: (field: FormFieldConfig) => ReactNode;
};

function FieldValue({
    field,
    value,
}: {
    field: SettingsFieldSchema;
    value: SettingsFormInput[SettingsFieldKey];
}) {
    const { t } = useTranslation();

    if (field.kind === "switch") {
        return (
            <span className="text-sm text-muted-foreground">
                {value ? t("common.active") : t("common.inactive")}
            </span>
        );
    }

    if (field.kind === "select") {
        const selected = field.options.find(
            (option) => String(option.value) === String(value)
        );
        return (
            <span className="text-sm break-all">
                {selected ? t(selected.label) : t("settings.common.not_set")}
            </span>
        );
    }

    const textValue = String(value ?? "").trim();
    return (
        <span className="text-sm break-all">
            {textValue ? textValue : t("settings.common.not_set")}
        </span>
    );
}

const SettingsSectionContent: FC<SectionContentProps> = ({
    section,
    sectionFields,
    formFieldsMap,
    syncedValues,
    pendingKeys,
    commitField,
    renderField,
}) => {
    const { t } = useTranslation();
    const [editingField, setEditingField] = useState<SettingsFieldKey | null>(null);
    const { getValues, setValue, reset, trigger } = useFormContext<SettingsFormInput>();

    useEffect(() => {
        reset(syncedValues);
    }, [syncedValues, reset]);

    const onSaveInlineField = useCallback(
        async (fieldKey: SettingsFieldKey) => {
            const isValid = await trigger(fieldKey);
            if (!isValid) return;

            const nextValue = getValues(fieldKey);
            const success = await commitField(fieldKey, nextValue);
            if (success) {
                setEditingField(null);
                return;
            }

            setValue(
                fieldKey,
                normalizeSettingValueForForm(fieldKey, syncedValues[fieldKey]),
                { shouldDirty: false }
            );
        },
        [commitField, getValues, setValue, syncedValues, trigger]
    );

    const onCancelInlineEdit = useCallback(
        (fieldKey: SettingsFieldKey) => {
            setValue(
                fieldKey,
                normalizeSettingValueForForm(fieldKey, syncedValues[fieldKey]),
                { shouldDirty: false }
            );
            setEditingField(null);
        },
        [setValue, syncedValues]
    );

    const onImmediateFieldChange = useCallback(
        async (fieldKey: SettingsFieldKey, nextValue: SettingsFormInput[SettingsFieldKey]) => {
            const previousValue = syncedValues[fieldKey];
            const success = await commitField(fieldKey, nextValue);
            if (!success) {
                setValue(
                    fieldKey,
                    normalizeSettingValueForForm(fieldKey, previousValue),
                    { shouldDirty: false }
                );
            }
        },
        [commitField, setValue, syncedValues]
    );

    return (
        <div className="space-y-4">
            <div className="rounded-md border px-4 py-3">
                <h1 className="text-base sm:text-lg font-semibold">
                    {t(SETTINGS_SECTION_SCHEMA[section].title)}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t(SETTINGS_SECTION_SCHEMA[section].description)}
                </p>
            </div>

            <div className="space-y-3">
                {sectionFields.map((field) => {
                    const fieldKey = field.key;
                    const fieldConfig = formFieldsMap.get(fieldKey);
                    const isPending = pendingKeys.has(fieldKey);
                    const isEditing = editingField === fieldKey;

                    return (
                        <div key={fieldKey} className="rounded-md border p-3 sm:p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="lg:w-1/2">
                                    <p className="text-sm font-medium">
                                        {t(`settings.fields.${fieldKey}.label`)}
                                    </p>
                                </div>

                                <div className="lg:w-1/2">
                                    {field.kind === "text" && fieldConfig ? (
                                        isEditing ? (
                                            <div className="space-y-2">
                                                {renderField(fieldConfig)}
                                                <div className="flex flex-wrap items-center justify-end gap-2">
                                                    <MyButton
                                                        type="button"
                                                        action="save"
                                                        title={t("common.save")}
                                                        variant="default"
                                                        loading={isPending}
                                                        onClick={() => void onSaveInlineField(fieldKey)}
                                                    />
                                                    <MyButton
                                                        type="button"
                                                        action="cancel"
                                                        title={t("common.cancel")}
                                                        disabled={isPending}
                                                        onClick={() => onCancelInlineEdit(fieldKey)}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-2">
                                                <FieldValue field={field} value={syncedValues[fieldKey]} />
                                                <MyButton
                                                    type="button"
                                                    action="edit"
                                                    title={t("settings.actions.edit")}
                                                    disabled={isPending}
                                                    onClick={() => setEditingField(fieldKey)}
                                                />
                                            </div>
                                        )
                                    ) : null}

                                    {field.kind === "switch" ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <FieldValue field={field} value={syncedValues[fieldKey]} />
                                            <div className="flex items-center gap-2">
                                                {isPending && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                )}
                                                <Switch
                                                    name={fieldKey}
                                                    className="justify-end"
                                                    disabled={isPending}
                                                    onValueChange={(checked) =>
                                                        void onImmediateFieldChange(fieldKey, checked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    {field.kind === "select" && fieldConfig ? (
                                        <div className="space-y-2">
                                            {isPending && (
                                                <div className="flex justify-end">
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                </div>
                                            )}
                                            {(() => {
                                                const placeholder =
                                                    "placeholder" in fieldConfig
                                                        ? fieldConfig.placeholder
                                                        : undefined;
                                                return (
                                                    <SelectDropdown
                                                        name={fieldKey}
                                                        options={field.options}
                                                        placeholder={placeholder}
                                                        isClearable={false}
                                                        isDisabled={isPending}
                                                        onValueChange={(value) =>
                                                            void onImmediateFieldChange(
                                                                fieldKey,
                                                                value as SettingsFormInput[SettingsFieldKey]
                                                            )
                                                        }
                                                    />
                                                );
                                            })()}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SettingsForm: FC<SettingsFormProps> = ({ section }) => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    const sectionConfig = SETTINGS_SECTION_SCHEMA[section];
    const formSchema = useMemo(() => buildSettingsFormSchema(section), [section]);
    const formFieldsMap = useMemo(
        () => new Map(formSchema.map((field) => [field.name, field])),
        [formSchema]
    );

    const [syncedValues, setSyncedValues] = useState<SettingsFormInput>(() =>
        normalizeSettingsForForm(settings as Partial<Record<string, unknown>>)
    );
    const [pendingKeys, setPendingKeys] = useState<Set<SettingsFieldKey>>(new Set());

    useEffect(() => {
        setSyncedValues(
            normalizeSettingsForForm(settings as Partial<Record<string, unknown>>)
        );
    }, [settings]);

    const { mutateAsync } = useApiMutation<unknown, SettingsPayload>({
        url: "/company/settings",
        method: "POST",
        invalidateKeys: "settings",
    });

    const commitField = useCallback<CommitFieldHandler>(
        async (key, value) => {
            const payloadValue = toSettingsPayloadValue(key, value);
            const payload = SettingsPayloadSchema.parse({
                settings: {
                    [key]: payloadValue,
                },
            });

            setPendingKeys((previous) => {
                const next = new Set(previous);
                next.add(key);
                return next;
            });

            try {
                await mutateAsync(payload);
                setSyncedValues((previous) => ({
                    ...previous,
                    [key]: normalizeSettingValueForForm(key, payloadValue),
                }));
                updateSettings({ [key]: payloadValue });
                toast.success(t("settings.messages.updated"));
                return true;
            } catch {
                return false;
            } finally {
                setPendingKeys((previous) => {
                    const next = new Set(previous);
                    next.delete(key);
                    return next;
                });
            }
        },
        [mutateAsync, t, updateSettings]
    );

    return (
        <div className="mx-auto w-2/3 flex justify-start pr-3">
            <FormBuilder
                formSchema={formSchema}
                grids={1}
                data={syncedValues as Record<string, unknown>}
                api="/company/settings"
                mode="create"
                schema={SettingsFormSchema}
                method="POST"
                queryKey="settings"
                actionButton={false}
            >
                {(renderField) => (
                    <SettingsSectionContent
                        section={section}
                        sectionFields={sectionConfig.fields}
                        formFieldsMap={formFieldsMap}
                        syncedValues={syncedValues}
                        pendingKeys={pendingKeys}
                        commitField={commitField}
                        renderField={renderField}
                    />
                )}
            </FormBuilder>
        </div>
    );
};

export default SettingsForm;

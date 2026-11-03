"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import InvoiceReceipt from "@/components/invoices/invoice-receipt";
import {
    DEFAULT_INVOICE_PRINT_SETTINGS,
    INVOICE_PRINT_BASIC_FLAG_KEYS,
    INVOICE_PRINT_CONTENT_SPACING,
    INVOICE_PRINT_FLAG_KEYS,
    INVOICE_PRINT_FONT_SIZE,
    INVOICE_PRINT_FONT_WEIGHTS,
    INVOICE_PRINT_MODES,
    InvoicePrintSettingsSchema,
    type InvoicePrintContentSpacing,
    type InvoicePrintFlagKey,
    type InvoicePrintFontWeight,
    type InvoicePrintMode,
    type InvoicePrintSettings,
} from "@/components/invoices/invoice-print-config";
import type { InvoiceDetail } from "@/components/invoices/invoice-type";
import MyButton from "@/components/my-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";

const previewPrintedAt = new Date(2026, 10, 2, 18, 17);

const previewInvoice = {
    id: 670,
    trackID: "INV670",
    total_amount: 800,
    discount: 0,
    line_total_discount: 50,
    total_discount: 50,
    after_discount_amount: 750,
    amount_paid: 500,
    amount_due: 250,
    client: {
        id: 1,
        sid: 670,
        name: "Mahi",
        phone: "01711000000",
        pppoe_username: "mahi",
    },
    lines: [
        {
            description: "Monthly package",
            amount: 800,
            quantity: 1,
            total_amount: 800,
            discount: 0,
        },
    ],
} as InvoiceDetail;

const sameSettings = (left: InvoicePrintSettings, right: InvoicePrintSettings) =>
    JSON.stringify(left) === JSON.stringify(right);

function fontSizeFromText(value: string, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) return fallback;
    if (parsed < INVOICE_PRINT_FONT_SIZE.min || parsed > INVOICE_PRINT_FONT_SIZE.max) return fallback;
    return parsed;
}

function ReceiptPreview({
    title,
    hint,
    printSettings,
}: {
    title: string;
    hint: string;
    printSettings?: InvoicePrintSettings;
}) {
    return (
        <section className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <div>
                <h2 className="text-sm font-medium text-foreground">{title}</h2>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
            <div className="overflow-x-auto rounded-md bg-white p-2">
                <InvoiceReceipt
                    invoices={[previewInvoice]}
                    printSettings={printSettings}
                    printedAt={previewPrintedAt}
                />
            </div>
        </section>
    );
}

export function InvoicePrintSettingsPage() {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission("company-settings.edit");
    const [draft, setDraft] = useState<InvoicePrintSettings>(DEFAULT_INVOICE_PRINT_SETTINGS);
    const [fontSizeText, setFontSizeText] = useState(String(DEFAULT_INVOICE_PRINT_SETTINGS.font_size));
    const [hydrated, setHydrated] = useState(false);

    const { data, isError, error, refetch } = useApiQuery<ApiResponse<InvoicePrintSettings>>({
        queryKey: ["invoice-print-settings"],
        url: "invoice-print-settings",
        pagination: false,
        staleTime: 0,
    });

    const saved = useMemo(() => {
        const parsed = InvoicePrintSettingsSchema.safeParse(data?.data);
        return parsed.success ? parsed.data : null;
    }, [data]);

    useEffect(() => {
        if (!saved || hydrated) return;
        setDraft(saved);
        setFontSizeText(String(saved.font_size));
        setHydrated(true);
    }, [saved, hydrated]);

    const applySaved = (next: unknown) => {
        const parsed = InvoicePrintSettingsSchema.safeParse(next);
        if (!parsed.success) return;
        setDraft(parsed.data);
        setFontSizeText(String(parsed.data.font_size));
        setHydrated(true);
    };

    const saveSettings = useApiMutation<InvoicePrintSettings, InvoicePrintSettings>({
        url: "/invoice-print-settings",
        method: "PUT",
        invalidateKeys: "invoice-print-settings",
        successMessage: "settings.invoice_print.saved",
        onSuccess: applySaved,
    });

    const resetSettings = useApiMutation<InvoicePrintSettings, InvoicePrintSettings>({
        url: "/invoice-print-settings",
        method: "PUT",
        invalidateKeys: "invoice-print-settings",
        successMessage: "settings.invoice_print.reset_done",
        onSuccess: applySaved,
    });

    const previewSettings = useMemo<InvoicePrintSettings>(
        () => ({
            ...draft,
            font_size: fontSizeFromText(fontSizeText, draft.font_size),
        }),
        [draft, fontSizeText],
    );

    const pending = saveSettings.isPending || resetSettings.isPending;
    const dirty = saved ? !sameSettings(previewSettings, saved) : false;

    function setFlag(key: InvoicePrintFlagKey, checked: boolean) {
        setDraft((current) => ({ ...current, [key]: checked }));
    }

    function commitFontSize() {
        const fontSize = fontSizeFromText(fontSizeText, draft.font_size);
        setFontSizeText(String(fontSize));
        setDraft((current) => ({ ...current, font_size: fontSize }));
    }

    async function save() {
        try {
            await saveSettings.mutateAsync(previewSettings);
        } catch {
            // The mutation hook shows the error toast.
        }
    }

    async function reset() {
        setDraft(DEFAULT_INVOICE_PRINT_SETTINGS);
        setFontSizeText(String(DEFAULT_INVOICE_PRINT_SETTINGS.font_size));
        try {
            await resetSettings.mutateAsync(DEFAULT_INVOICE_PRINT_SETTINGS);
        } catch {
            if (saved) {
                setDraft(saved);
                setFontSizeText(String(saved.font_size));
            }
        }
    }

    if (isError || (data && !saved)) {
        return (
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <p>{t(parseApiError(error) || "settings.invoice_print.load_error")}</p>
                <div>
                    <MyButton action="reset" variant="outline" title="common.refresh" onClick={() => void refetch()} />
                </div>
            </div>
        );
    }

    if (!saved || !hydrated) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                <div>
                    <h1 className="text-lg font-medium text-foreground">{t("settings.invoice_print.title")}</h1>
                    <p className="text-sm text-muted-foreground">{t("settings.invoice_print.description")}</p>
                </div>
                <RadioGroup
                    value={draft.mode}
                    disabled={!canEdit || pending}
                    aria-label={t("settings.invoice_print.mode_label")}
                    className="flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2"
                    onValueChange={(value) => {
                        if (!(INVOICE_PRINT_MODES as readonly string[]).includes(value)) return;
                        setDraft((current) => ({ ...current, mode: value as InvoicePrintMode }));
                    }}
                >
                    {INVOICE_PRINT_MODES.map((mode) => (
                        <label
                            key={mode}
                            htmlFor={`invoice-print-mode-${mode}`}
                            className={cn(
                                "flex cursor-pointer items-center gap-2 text-sm text-foreground",
                                (!canEdit || pending) && "cursor-not-allowed",
                            )}
                        >
                            <RadioGroupItem
                                id={`invoice-print-mode-${mode}`}
                                value={mode}
                                disabled={!canEdit || pending}
                                aria-label={t(`settings.invoice_print.modes.${mode}`)}
                            />
                            {t(`settings.invoice_print.modes.${mode}`)}
                        </label>
                    ))}
                </RadioGroup>
                {canEdit && (
                    <div className="flex items-center justify-end gap-2">
                        <MyButton
                            action="reset"
                            variant="outline"
                            title="settings.invoice_print.reset"
                            loading={resetSettings.isPending}
                            disabled={pending || sameSettings(previewSettings, DEFAULT_INVOICE_PRINT_SETTINGS)}
                            onClick={() => void reset()}
                        />
                        <MyButton
                            action="save"
                            variant="default"
                            title="settings.invoice_print.save"
                            loading={saveSettings.isPending}
                            disabled={pending || !dirty}
                            onClick={() => void save()}
                        />
                    </div>
                )}
            </div>

            <section className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-medium text-foreground">{t("settings.invoice_print.visibility")}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(draft.mode === "basic" ? INVOICE_PRINT_BASIC_FLAG_KEYS : INVOICE_PRINT_FLAG_KEYS).map((key) => (
                        <div key={key} className="flex items-center justify-between gap-3">
                            <Label htmlFor={key}>{t(`settings.invoice_print.flags.${key}`)}</Label>
                            <Switch
                                id={key}
                                checked={draft[key]}
                                disabled={!canEdit || pending}
                                onCheckedChange={(checked) => setFlag(key, checked)}
                                aria-label={t(`settings.invoice_print.flags.${key}`)}
                            />
                        </div>
                    ))}
                </div>

                <h2 className="mt-6 text-sm font-medium text-foreground">{t("settings.invoice_print.typography")}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="invoice-print-font-size">{t("settings.invoice_print.font_size")}</Label>
                        <Input
                            id="invoice-print-font-size"
                            type="number"
                            inputMode="numeric"
                            min={INVOICE_PRINT_FONT_SIZE.min}
                            max={INVOICE_PRINT_FONT_SIZE.max}
                            step={1}
                            value={fontSizeText}
                            disabled={!canEdit || pending}
                            onChange={(event) => setFontSizeText(event.target.value)}
                            onBlur={commitFontSize}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t("settings.invoice_print.font_size_hint", {
                                min: INVOICE_PRINT_FONT_SIZE.min,
                                max: INVOICE_PRINT_FONT_SIZE.max,
                            })}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="invoice-print-font-weight">{t("settings.invoice_print.font_weight")}</Label>
                        <Select
                            value={String(draft.font_weight)}
                            disabled={!canEdit || pending}
                            onValueChange={(value) => {
                                const weight = Number(value);
                                if (!(INVOICE_PRINT_FONT_WEIGHTS as readonly number[]).includes(weight)) return;
                                setDraft((current) => ({
                                    ...current,
                                    font_weight: weight as InvoicePrintFontWeight,
                                }));
                            }}
                        >
                            <SelectTrigger id="invoice-print-font-weight" aria-label={t("settings.invoice_print.font_weight")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {INVOICE_PRINT_FONT_WEIGHTS.map((weight) => (
                                    <SelectItem key={weight} value={String(weight)}>
                                        {weight}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                        <Label htmlFor="invoice-print-content-spacing">{t("settings.invoice_print.content_spacing")}</Label>
                        <Select
                            value={draft.content_spacing}
                            disabled={!canEdit || pending}
                            onValueChange={(value) => {
                                if (!(INVOICE_PRINT_CONTENT_SPACING as readonly string[]).includes(value)) return;
                                setDraft((current) => ({
                                    ...current,
                                    content_spacing: value as InvoicePrintContentSpacing,
                                }));
                            }}
                        >
                            <SelectTrigger
                                id="invoice-print-content-spacing"
                                aria-label={t("settings.invoice_print.content_spacing")}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {INVOICE_PRINT_CONTENT_SPACING.map((spacing) => (
                                    <SelectItem key={spacing} value={spacing}>
                                        {t(`settings.invoice_print.content_spacing_options.${spacing}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {t(`settings.invoice_print.content_spacing_hints.${draft.content_spacing}`)}
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ReceiptPreview
                    title={t("settings.invoice_print.original_preview")}
                    hint={t("settings.invoice_print.original_hint")}
                />
                <ReceiptPreview
                    title={t("settings.invoice_print.custom_preview")}
                    hint={t("settings.invoice_print.custom_hint")}
                    printSettings={previewSettings}
                />
            </div>
        </div>
    );
}

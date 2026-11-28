"use client";

import { FC, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FileCheck2, TriangleAlert } from "lucide-react";
import { MyDialog } from "@/components/my-dialog";
import MyButton from "@/components/my-button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";

export type MissingInvoiceMode = "full_month" | "rest_of_month";

export type MissingInvoiceClient = {
    uuid: string;
    name: string;
    client_id: string | null;
    phone: string | null;
    pppoe_username: string | null;
    invoice_day: number;
    package_name: string | null;
    package_price: number;
    discount: number;
    full_month_amount: number;
    rest_of_month_amount: number;
};

type MissingInvoiceList = {
    /** "2026-11" */
    month: string;
    /** Billing days left in the 30-day month; 0 on day 30 and 31. */
    remaining_days: number;
    clients: MissingInvoiceClient[];
};

type MissingInvoiceResult = { queued: number; skipped: number };
type MissingInvoicePayload = { client_ids: string[]; mode: MissingInvoiceMode };

const MISSING_INVOICES_KEY = "invoices-missing";
const SKELETON_ROWS = 6;

function monthLabel(month: string | undefined, language: string): string {
    if (!month) return "";
    const date = new Date(`${month}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) return month;
    return new Intl.DateTimeFormat(language, { month: "long", year: "numeric" }).format(date);
}

interface MissingInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MissingInvoiceDialog: FC<MissingInvoiceDialogProps> = ({ open, onOpenChange }) => {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [mode, setMode] = useState<MissingInvoiceMode>("full_month");

    const { data, isLoading, isError } = useApiQuery<ApiResponse<MissingInvoiceList>>({
        queryKey: [MISSING_INVOICES_KEY],
        url: "invoices/missing",
        pagination: false,
        enabled: open,
        // The list changes as invoices are made, so every open reads it again.
        staleTime: 0,
        gcTime: 0,
    });

    const clients = useMemo(() => data?.data?.clients ?? [], [data]);
    const remainingDays = toNumber(data?.data?.remaining_days);
    const month = monthLabel(data?.data?.month, i18n.language);
    // A client that left the list (billed meanwhile) drops out of the selection.
    const selected = useMemo(
        () => clients.filter((client) => selectedIds.includes(client.uuid)),
        [clients, selectedIds],
    );
    const allSelected = clients.length > 0 && selected.length === clients.length;
    const canBillRest = remainingDays > 0;

    const totals = useMemo(
        () => ({
            full_month: selected.reduce((sum, client) => sum + toNumber(client.full_month_amount), 0),
            rest_of_month: selected.reduce((sum, client) => sum + toNumber(client.rest_of_month_amount), 0),
        }),
        [selected],
    );

    const { mutate: createInvoices, isPending } = useApiMutation<MissingInvoiceResult, MissingInvoicePayload>({
        url: "invoices/missing",
        method: "POST",
        onSuccess: (result) => {
            const queued = toNumber(result?.queued);
            const skipped = toNumber(result?.skipped);
            if (queued > 0) toast.success(t("invoice.missing.success", { count: queued }));
            if (skipped > 0) toast.info(t("invoice.missing.skipped", { count: skipped }));
            setSelectedIds([]);
            setConfirmOpen(false);
            onOpenChange(false);
            [MISSING_INVOICES_KEY, "invoices", "clients"].forEach((key) =>
                queryClient.invalidateQueries({ queryKey: [key] }),
            );
        },
    });

    const toggleClient = (uuid: string, checked: boolean) => {
        setSelectedIds((current) =>
            checked ? [...current.filter((id) => id !== uuid), uuid] : current.filter((id) => id !== uuid),
        );
    };

    const openConfirm = () => {
        setMode("full_month");
        setConfirmOpen(true);
    };

    const options: { value: MissingInvoiceMode; disabled: boolean; hint: string }[] = [
        { value: "full_month", disabled: false, hint: t("invoice.missing.mode.full_month.hint") },
        {
            value: "rest_of_month",
            disabled: !canBillRest,
            hint: canBillRest
                ? t("invoice.missing.mode.rest_of_month.hint", { days: remainingDays })
                : t("invoice.missing.mode.rest_of_month.unavailable"),
        },
    ];

    return (
        <>
            <MyDialog
                open={open}
                onOpenChange={onOpenChange}
                title="invoice.missing.title"
                size="2xl"
                footer={({ close }) => (
                    <>
                        <MyButton
                            action="cancel"
                            variant="outline"
                            size="default"
                            onClick={close}
                            title={t("common.cancel")}
                        />
                        <MyButton
                            action="create"
                            variant="default"
                            size="default"
                            onClick={openConfirm}
                            disabled={selected.length === 0}
                            title={t("invoice.missing.create", { count: selected.length })}
                        />
                    </>
                )}
            >
                <div className="space-y-3">
                    {/* One line is reserved so the list does not move when the month arrives. */}
                    <p className="min-h-5 text-sm text-muted-foreground">
                        {month ? t("invoice.missing.description", { month }) : ""}
                    </p>
                    <div className="rounded-md border">
                        <label className="flex items-center gap-3 border-b bg-muted/50 px-3 py-2">
                            <Checkbox
                                checked={allSelected}
                                disabled={clients.length === 0}
                                onCheckedChange={(checked) =>
                                    setSelectedIds(checked === true ? clients.map((client) => client.uuid) : [])
                                }
                                aria-label={t("invoice.missing.select_all")}
                            />
                            <span className="text-sm font-medium">{t("invoice.missing.select_all")}</span>
                            <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                                {t("invoice.missing.selected", { selected: selected.length, total: clients.length })}
                            </span>
                        </label>
                        {/* Fixed height: loading, empty and loaded lists take the same room. */}
                        <div className="h-80 divide-y overflow-y-auto">
                            {isLoading ? (
                                Array.from({ length: SKELETON_ROWS }, (_, index) => (
                                    <div key={index} className="flex items-center gap-3 px-3 py-2" aria-hidden>
                                        <Skeleton className="h-4 w-4 shrink-0" />
                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-56" />
                                        </div>
                                        <Skeleton className="h-4 w-12 shrink-0" />
                                    </div>
                                ))
                            ) : clients.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 px-3 text-center text-muted-foreground">
                                    <FileCheck2 className="h-10 w-10" aria-hidden />
                                    <p className="text-sm">
                                        {t(isError ? "common.request_failed" : "invoice.missing.empty")}
                                    </p>
                                </div>
                            ) : (
                                clients.map((client) => (
                                    <label
                                        key={client.uuid}
                                        className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/50"
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(client.uuid)}
                                            onCheckedChange={(checked) => toggleClient(client.uuid, checked === true)}
                                            aria-label={client.name}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{client.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {[client.client_id, client.pppoe_username, client.package_name]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </p>
                                            {toNumber(client.package_price) <= 0 && (
                                                <p className="flex items-center gap-1 text-xs text-destructive">
                                                    <TriangleAlert className="h-3 w-3 shrink-0" aria-hidden />
                                                    {t("invoice.missing.no_price")}
                                                </p>
                                            )}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-medium tabular-nums">
                                                {formatMoney(client.full_month_amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {t("invoice.missing.invoice_day", { day: client.invoice_day })}
                                            </p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </MyDialog>

            <MyDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="invoice.missing.confirm.title"
                titleValues={{ count: selected.length }}
                size="md"
                loading={isPending}
                footer={({ close, loading }) => (
                    <>
                        <MyButton
                            action="cancel"
                            variant="outline"
                            size="default"
                            onClick={close}
                            disabled={loading}
                            title={t("common.cancel")}
                        />
                        <MyButton
                            action="save"
                            variant="default"
                            size="default"
                            loading={loading}
                            disabled={selected.length === 0}
                            onClick={() =>
                                createInvoices({ client_ids: selected.map((client) => client.uuid), mode })
                            }
                            title={t("invoice.missing.confirm.submit")}
                        />
                    </>
                )}
            >
                <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {t("invoice.missing.confirm.description", { month })}
                    </p>
                    <RadioGroup
                        value={mode}
                        onValueChange={(value) => setMode(value as MissingInvoiceMode)}
                        aria-label={t("invoice.missing.confirm.title", { count: selected.length })}
                    >
                        {options.map((option) => (
                            <label
                                key={option.value}
                                className={cn(
                                    "flex items-start gap-3 rounded-md border p-3",
                                    option.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                    mode === option.value && "border-primary bg-muted/50",
                                )}
                            >
                                <RadioGroupItem
                                    value={option.value}
                                    disabled={option.disabled}
                                    className="mt-0.5"
                                    aria-label={t(`invoice.missing.mode.${option.value}.label`)}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        {t(`invoice.missing.mode.${option.value}.label`)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{option.hint}</p>
                                </div>
                                <p className="shrink-0 text-sm font-medium tabular-nums">
                                    {formatMoney(totals[option.value])}
                                </p>
                            </label>
                        ))}
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">{t("invoice.missing.confirm.note")}</p>
                </div>
            </MyDialog>
        </>
    );
};

export default MissingInvoiceDialog;

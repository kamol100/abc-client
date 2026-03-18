"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { MyDialog } from "@/components/my-dialog";
import ActionButton from "@/components/action-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import DatePicker from "@/components/form/DatePicker";
import RadioField from "@/components/form/radio-field";
import TextareaField from "@/components/form/textarea-field";
import InputField from "@/components/form/input-field";
import useApiMutation from "@/hooks/use-api-mutation";
import { formatMoney } from "@/lib/helper/helper";
import { InvoiceDueItem } from "@/components/clients/client-type";
import { BulkInvoicePayFormInput, BulkInvoicePayInput, BulkInvoicePaySchema } from "./invoice-type";
import { BadgePercent, FileText } from "lucide-react";
import dynamic from "next/dynamic";
import { usePermissions } from "@/context/app-provider";
import InvoiceDiscountDialog from "@/components/invoices/invoice-discount-dialog";

const SelectDropdown = dynamic(() => import("@/components/select-dropdown"));

interface BulkInvoicePayDialogProps {
    invoiceDue: InvoiceDueItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const BulkInvoicePayDialog: FC<BulkInvoicePayDialogProps> = ({
    invoiceDue,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const canDiscount = hasPermission("invoices.edit");
    const allUuids = useMemo(() => invoiceDue.map((i) => i.uuid), [invoiceDue]);
    const [selectedIds, setSelectedIds] = useState<string[]>(allUuids);

    const form = useForm<BulkInvoicePayFormInput>({
        resolver: zodResolver(BulkInvoicePaySchema),
        defaultValues: {
            invoice_ids: allUuids,
            fund_id: undefined,
            payment_date: "",
            status: "paid",
            partial_amount: 0,
            confirmation_sms: 0,
            note: "",
        },
    });

    const { handleSubmit, watch, setValue, setError } = form;
    const status = watch("status");

    const toggleInvoice = useCallback(
        (uuid: string, checked: boolean) => {
            setSelectedIds((prev) => {
                const next = checked
                    ? [...prev, uuid]
                    : prev.filter((id) => id !== uuid);
                setValue("invoice_ids", next);
                return next;
            });
        },
        [setValue],
    );

    const toggleAll = useCallback(
        (checked: boolean) => {
            const next = checked ? allUuids : [];
            setSelectedIds(next);
            setValue("invoice_ids", next);
        },
        [allUuids, setValue],
    );

    const totals = useMemo(() => {
        const selected = invoiceDue.filter((i) => selectedIds.includes(i.uuid));
        return {
            amount: selected.reduce((sum, i) => sum + i.total_amount, 0),
            discount: selected.reduce(
                (sum, i) => sum + i.discount + i.line_total_discount,
                0,
            ),
            paid: selected.reduce((sum, i) => sum + i.amount_paid, 0),
            due: selected.reduce(
                (sum, i) => sum + (i.after_discount_amount - i.amount_paid),
                0,
            ),
        };
    }, [invoiceDue, selectedIds]);

    const { mutate: submitBulkPay, isPending } = useApiMutation<
        unknown,
        BulkInvoicePayInput
    >({
        url: "invoices/bulk-pay",
        method: "POST",
        invalidateKeys: "clients,invoices",
        successMessage: "invoice.bulk_pay.success",
        onSuccess: () => onOpenChange(false),
    });

    const onSubmit = (data: BulkInvoicePayInput) => {
        console.log(data);
        if (data.invoice_ids.length === 0) {
            setError("invoice_ids", {
                message: t("invoice.bulk_pay.errors.select_invoice"),
            });
            return;
        }
        if (data.status === "partial" && data.partial_amount <= 0) {
            setError("partial_amount", {
                message: t("invoice.bulk_pay.partial_amount.errors.min"),
            });
            return;
        }
        submitBulkPay(data);
    };

    const hasInvoices = invoiceDue.length > 0;

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            title="invoice.bulk_pay.title"
            size="xl"
            loading={isPending}
            footer={({ close, loading }) =>
                hasInvoices ? (
                    <>
                        <ActionButton
                            action="cancel"
                            variant="outline"
                            size="default"
                            onClick={close}
                            disabled={loading}
                            title={t("common.cancel")}
                        />
                        <ActionButton
                            action="save"
                            variant="default"
                            size="default"
                            onClick={handleSubmit((data) => onSubmit(data as BulkInvoicePayInput))}
                            loading={loading}
                            title={t("invoice.bulk_pay.submit")}
                        />
                    </>
                ) : (
                    <ActionButton
                        action="cancel"
                        variant="outline"
                        size="default"
                        onClick={close}
                        title={t("common.cancel")}
                    />
                )
            }
        >
            {!hasInvoices ? (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                    <FileText className="h-10 w-10" />
                    <p>{t("invoice.bulk_pay.no_due_invoices")}</p>
                </div>
            ) : (
                <Form {...form}>
                    <div className="space-y-4">
                        {/* Invoice list */}
                        <div className="rounded-md border">
                            <div className="flex items-center gap-3 border-b px-3 py-2 bg-muted/50">
                                <Checkbox
                                    checked={
                                        selectedIds.length === allUuids.length
                                    }
                                    onCheckedChange={(checked) =>
                                        toggleAll(checked === true)
                                    }
                                />
                                <span className="text-sm font-medium">
                                    {t("invoice.bulk_pay.select_all")}
                                </span>
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y">
                                {invoiceDue.map((item) => {
                                    const due =
                                        item.after_discount_amount -
                                        item.amount_paid;
                                    const discountValue =
                                        item.discount + item.line_total_discount;
                                    return (
                                        <div
                                            key={item.uuid}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30"
                                        >
                                            <Checkbox
                                                checked={selectedIds.includes(
                                                    item.uuid,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    toggleInvoice(
                                                        item.uuid,
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="flex-1 min-w-0 text-left"
                                                onClick={() =>
                                                    toggleInvoice(
                                                        item.uuid,
                                                        !selectedIds.includes(
                                                            item.uuid,
                                                        ),
                                                    )
                                                }
                                            >
                                                <p className="text-sm truncate font-medium">
                                                    {item.trackID}
                                                    {item.invoice_type &&
                                                        ` - ${item.invoice_type}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {t(
                                                        "invoice.bulk_pay.row.discount",
                                                    )}
                                                    : ৳
                                                    {formatMoney(discountValue)}{" "}
                                                    • {t("invoice.bulk_pay.row.paid")}
                                                    : ৳
                                                    {formatMoney(
                                                        item.amount_paid,
                                                    )}
                                                </p>
                                            </button>
                                            <span className="text-sm font-medium text-destructive whitespace-nowrap">
                                                ৳{formatMoney(due)}
                                            </span>
                                            {canDiscount && (
                                                <InvoiceDiscountDialog
                                                    invoice={{
                                                        uuid: item.uuid,
                                                        trackID: item.trackID,
                                                        invoice_type:
                                                            item.invoice_type,
                                                        total_amount:
                                                            item.total_amount,
                                                        discount: item.discount,
                                                        line_total_discount:
                                                            item.line_total_discount,
                                                        amount_paid:
                                                            item.amount_paid,
                                                        after_discount_amount:
                                                            item.after_discount_amount,
                                                    }}
                                                    trigger={
                                                        <ActionButton
                                                            type="button"
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                            }}
                                                            aria-label={t(
                                                                "invoice.discount_dialog.title",
                                                            )}
                                                        >
                                                            <BadgePercent className="h-4 w-4" />
                                                        </ActionButton>
                                                    }
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                            <div className="rounded-md bg-muted/50 p-2 text-center">
                                <p className="text-muted-foreground text-xs">
                                    {t("invoice.bulk_pay.total_amount")}
                                </p>
                                <p className="font-semibold">
                                    ৳{formatMoney(totals.amount)}
                                </p>
                            </div>
                            <div className="rounded-md bg-muted/50 p-2 text-center">
                                <p className="text-muted-foreground text-xs">
                                    {t("invoice.bulk_pay.total_discount")}
                                </p>
                                <p className="font-semibold">
                                    ৳{formatMoney(totals.discount)}
                                </p>
                            </div>
                            <div className="rounded-md bg-muted/50 p-2 text-center">
                                <p className="text-muted-foreground text-xs">
                                    {t("invoice.bulk_pay.total_paid")}
                                </p>
                                <p className="font-semibold">
                                    ৳{formatMoney(totals.paid)}
                                </p>
                            </div>
                            <div className="rounded-md bg-destructive/10 p-2 text-center">
                                <p className="text-muted-foreground text-xs">
                                    {t("invoice.bulk_pay.total_due")}
                                </p>
                                <p className="font-bold text-destructive">
                                    ৳{formatMoney(totals.due)}
                                </p>
                            </div>
                        </div>

                        {/* Form fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectDropdown
                                name="fund_id"
                                label={{
                                    labelText: t(
                                        "invoice.bulk_pay.fund.label",
                                    ),
                                    mandatory: true,
                                }}
                                placeholder={t(
                                    "invoice.bulk_pay.fund.placeholder",
                                )}
                                api="/dropdown-funds"
                            />
                            <DatePicker
                                name="payment_date"
                                label={{
                                    labelText: t(
                                        "invoice.bulk_pay.payment_date.label",
                                    ),
                                }}
                                placeholder={t(
                                    "invoice.bulk_pay.payment_date.placeholder",
                                )}
                                mode="single"
                            />
                            <RadioField
                                name="status"
                                label={{
                                    labelText: t(
                                        "invoice.bulk_pay.status.label",
                                    ),
                                }}
                                options={[
                                    {
                                        label: t("common.paid"),
                                        value: "paid",
                                    },
                                    {
                                        label: t("payment.partial_paid"),
                                        value: "partial",
                                    },
                                ]}
                                defaultValue="paid"
                                direction="row"
                            />
                            {status === "partial" && (
                                <InputField
                                    name="partial_amount"
                                    label={{
                                        labelText: t(
                                            "invoice.bulk_pay.partial_amount.label",
                                        ),
                                    }}
                                    placeholder={t(
                                        "invoice.bulk_pay.partial_amount.placeholder",
                                    )}
                                    type="number"
                                />
                            )}
                            <RadioField
                                name="confirmation_sms"
                                label={{
                                    labelText: t(
                                        "invoice.bulk_pay.confirmation_sms.label",
                                    ),
                                }}
                                options={[
                                    { label: t("common.yes"), value: 1 },
                                    { label: t("common.no"), value: 0 },
                                ]}
                                defaultValue="0"
                                direction="row"
                            />
                        </div>
                        <TextareaField
                            name="note"
                            label={{
                                labelText: t("invoice.bulk_pay.note.label"),
                            }}
                            placeholder={t(
                                "invoice.bulk_pay.note.placeholder",
                            )}
                            rows={2}
                        />
                    </div>
                </Form>
            )}
        </MyDialog>
    );
};

export default BulkInvoicePayDialog;

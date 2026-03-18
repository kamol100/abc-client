"use client";

import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ActionButton from "@/components/action-button";
import { MyDialog } from "@/components/my-dialog";
import InputField from "@/components/form/input-field";
import { Form } from "@/components/ui/form";
import useApiMutation from "@/hooks/use-api-mutation";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import {
    InvoiceDiscountInput,
    InvoiceDiscountSchema,
} from "@/components/invoices/invoice-type";

type InvoiceDiscountTarget = {
    uuid: string;
    trackID?: string | null;
    invoice_type?: string | null;
    total_amount?: number | null;
    discount?: number | null;
    line_total_discount?: number | null;
    amount_paid?: number | null;
    after_discount_amount?: number | null;
};

type InvoiceDiscountDialogProps = {
    invoice: InvoiceDiscountTarget;
    trigger?: ReactNode;
    onUpdated?: () => void;
};

const InvoiceDiscountDialog: FC<InvoiceDiscountDialogProps> = ({
    invoice,
    trigger,
    onUpdated,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const form = useForm<InvoiceDiscountInput>({
        resolver: zodResolver(InvoiceDiscountSchema),
        defaultValues: {
            discount_amount: 0,
        },
    });
    const { handleSubmit, setError, reset } = form;

    const currentDiscount = useMemo(
        () => toNumber(invoice.discount) + toNumber(invoice.line_total_discount),
        [invoice.discount, invoice.line_total_discount],
    );
    const maxDiscount = useMemo(
        () => toNumber(invoice.after_discount_amount) - toNumber(invoice.amount_paid),
        [invoice.after_discount_amount, invoice.amount_paid],
    );

    const { mutateAsync: applyDiscount, isPending } = useApiMutation<
        unknown,
        InvoiceDiscountInput
    >({
        url: `invoice-discount/${invoice.uuid}`,
        method: "PUT",
        invalidateKeys: "clients,invoices",
        successMessage: "invoice.discount_dialog.success",
        onSuccess: () => {
            onUpdated?.();
            setOpen(false);
            reset({ discount_amount: 0 });
        },
    });

    const onSubmit = async (values: InvoiceDiscountInput) => {
        if (toNumber(values.discount_amount) > maxDiscount) {
            setError("discount_amount", {
                message: t("invoice.discount_dialog.discount_amount.errors.max", {
                    amount: formatMoney(maxDiscount),
                }),
            });
            return;
        }
        await applyDiscount(values);
    };

    const handleDiscountAmountFocus = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const target = e.target;
            const scrollIntoView = () => {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "end",
                });
            };
            requestAnimationFrame(scrollIntoView);
            setTimeout(scrollIntoView, 400);
        },
        [],
    );

    return (
        <MyDialog
            open={open}
            onOpenChange={setOpen}
            title="invoice.discount_dialog.title"
            size="md"
            loading={isPending}
            contentClassName="max-h-[80vh] sm:max-h-[90vh]"
            trigger={
                trigger ?? (
                    <ActionButton
                        action="edit"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        aria-label={t("invoice.discount_dialog.title")}
                    />
                )
            }
            footer={({ close, loading }) => (
                <>
                    <ActionButton
                        action="cancel"
                        variant="outline"
                        size="default"
                        onClick={() => {
                            close();
                            reset({ discount_amount: 0 });
                        }}
                        disabled={loading}
                        title={t("common.cancel")}
                    />
                    <ActionButton
                        action="save"
                        variant="default"
                        size="default"
                        onClick={handleSubmit(onSubmit)}
                        loading={loading}
                        title={t("invoice.discount_dialog.submit")}
                    />
                </>
            )}
        >
            <div className="space-y-4 pb-4">
                <div className="rounded-md border p-3 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <p className="text-muted-foreground">
                                {t("invoice.discount_dialog.summary.invoice_id")}
                            </p>
                            <p className="font-medium">{invoice.trackID || "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                {t("invoice.discount_dialog.summary.type")}
                            </p>
                            <p className="font-medium">{invoice.invoice_type || "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                {t("invoice.discount_dialog.summary.total")}
                            </p>
                            <p className="font-medium">
                                ৳{formatMoney(invoice.total_amount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                {t("invoice.discount_dialog.summary.current_discount")}
                            </p>
                            <p className="font-medium text-green-600">
                                ৳{formatMoney(currentDiscount)}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-muted-foreground">
                                {t("invoice.discount_dialog.summary.max_allowed")}
                            </p>
                            <p className="font-semibold text-destructive">
                                ৳{formatMoney(maxDiscount)}
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <InputField
                        name="discount_amount"
                        type="number"
                        label={{
                            labelText: "invoice.discount_dialog.discount_amount.label",
                            mandatory: true,
                        }}
                        placeholder="invoice.discount_dialog.discount_amount.placeholder"
                        onFocus={handleDiscountAmountFocus}
                    />
                </Form>
            </div>
        </MyDialog>
    );
};

export type { InvoiceDiscountTarget };
export default InvoiceDiscountDialog;

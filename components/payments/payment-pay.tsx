"use client";

import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { formatMoney, parseApiError } from "@/lib/helper/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ActionButton from "../action-button";
import DatePicker from "../form/DatePicker";
import InputField from "../form/input-field";
import RadioField from "../form/radio-field";
import TextareaField from "../form/textarea-field";
import { Form } from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import { PaymentPaySchema, PaymentRow } from "./payment-type";
import dynamic from "next/dynamic";

const SelectDropdown = dynamic(() => import("../select-dropdown"));

type Props = {
    paymentId: string;
};

const PaymentPay: FC<Props> = ({ paymentId }) => {
    const router = useRouter();
    const { t } = useTranslation();

    const { data: detailResponse, isLoading } = useApiQuery<
        ApiResponse<PaymentRow>
    >({
        queryKey: ["payments", "detail", paymentId],
        url: `payments/${paymentId}`,
        pagination: false,
    });

    const payment = detailResponse?.data as PaymentRow | undefined;

    const form = useForm<FieldValues>({
        resolver: zodResolver(PaymentPaySchema),
        mode: "onChange",
        defaultValues: {
            fund_id: undefined,
            payment_date: undefined,
            discount: 0,
            confirmation_sms: 1,
            transaction_id: "",
            reference: "",
            note: "",
            payment_type_id: undefined,
        },
    });

    const { handleSubmit, reset } = form;

    useEffect(() => {
        if (!payment) return;
        reset({
            fund_id: payment.fund_id ?? undefined,
            payment_date: payment.payment_date ?? undefined,
            discount: payment.discount ?? 0,
            confirmation_sms: 1,
            transaction_id: payment.transaction_id ?? "",
            reference: payment.reference ?? "",
            note: payment.note ?? "",
            payment_type_id: payment.payment_type_id ?? undefined,
        });
    }, [payment, reset]);

    const { mutate: submitPayment, isPending } = useApiMutation<
        { data?: Record<string, unknown>; message?: string },
        FieldValues
    >({
        url: `payments/${paymentId}`,
        method: "PUT",
        invalidateKeys: "payments",
        onSuccess: (data) => {
            if (data?.message) {
                toast.success(t(String(data.message)));
            } else {
                toast.success(t("payment.pay_success"));
            }
            router.push("/payments");
        },
    });

    const onSubmit = (formValues: FieldValues) => {
        submitPayment({
            ...formValues,
            status: "paid",
            amount: payment?.amount,
            title: payment?.title,
            client_id: payment?.client_id,
        });
    };

    if (isLoading) {
        return (
            <div className="w-full md:w-3/4 mx-auto space-y-4 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ))}
            </div>
        );
    }

    if (!payment) return null;

    return (
        <div className="w-full md:w-3/4 mx-auto flex flex-col flex-1 min-h-0">
            <div className="rounded-lg border bg-muted/50 p-4 mb-6">
                <p className="text-center font-bold text-destructive mb-4">
                    {t("payment.bill_due")}: ৳{formatMoney(payment.amount)}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                        <p>
                            <span className="text-muted-foreground">{t("payment.pppoe_id")}:</span>{" "}
                            {payment.client?.pppoe_username}
                        </p>
                        <p>
                            <span className="text-muted-foreground">{t("common.name")}:</span>{" "}
                            {payment.client?.name}
                        </p>
                        <p>
                            <span className="text-muted-foreground">{t("payment.bill_created")}:</span>{" "}
                            {payment.created_at}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p>
                            <span className="text-muted-foreground">{t("common.phone")}:</span>{" "}
                            {payment.client?.phone}
                        </p>
                        <p>
                            <span className="text-muted-foreground">{t("common.address")}:</span>{" "}
                            {payment.client?.current_address}
                        </p>
                        <p>
                            <span className="text-muted-foreground">{t("payment.bill_deadline")}:</span>{" "}
                            {payment.due_date}
                        </p>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 min-h-0"
                >
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectDropdown
                                name="fund_id"
                                label={{ labelText: t("payment.fund.label"), mandatory: true }}
                                placeholder={t("payment.fund.placeholder")}
                                api="/dropdown-funds"
                            />
                            <SelectDropdown
                                name="payment_type_id"
                                label={{ labelText: t("payment.payment_type.label") }}
                                placeholder={t("payment.payment_type.placeholder")}
                                api="/dropdown-payment-types"
                            />
                            <InputField
                                name="transaction_id"
                                label={{ labelText: t("payment.transaction_id.label") }}
                                placeholder={t("payment.transaction_id.placeholder")}
                            />
                            <InputField
                                name="discount"
                                label={{ labelText: t("payment.discount.label") }}
                                placeholder={t("payment.discount.placeholder")}
                                type="number"
                            />
                            <InputField
                                name="reference"
                                label={{ labelText: t("payment.reference.label") }}
                                placeholder={t("payment.reference.placeholder")}
                            />
                            <DatePicker
                                name="payment_date"
                                label={{ labelText: t("payment.payment_date.label") }}
                                placeholder={t("payment.payment_date.placeholder")}
                                mode="single"
                            />
                            <RadioField
                                name="confirmation_sms"
                                label={{ labelText: t("payment.confirmation_sms.label") }}
                                options={[
                                    { label: t("common.yes"), value: 1 },
                                    { label: t("common.no"), value: 0 },
                                ]}
                                defaultValue="1"
                                direction="row"
                            />
                        </div>
                        <TextareaField
                            name="note"
                            label={{ labelText: t("common.note") }}
                            placeholder={t("common.optional_note")}
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4 mt-4 border-t bg-background shrink-0 justify-center">
                        <ActionButton
                            action="cancel"
                            type="button"
                            title={t("common.cancel")}
                            size="default"
                            onClick={() => router.push("/payments")}
                        />
                        <ActionButton
                            action="save"
                            title={t("payment.pay_now")}
                            size="default"
                            type="submit"
                            variant="default"
                            loading={isPending}
                        />
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default PaymentPay;

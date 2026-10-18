"use client";

import { FC, useState } from "react";
import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import DisplayCount from "@/components/display-count";
import LazyBulkInvoicePayDialog from "@/components/invoices/lazy-bulk-invoice-pay-dialog";
import { usePermissions } from "@/context/app-provider";
import { ClientRow } from "@/components/clients/client-type";
import { cn } from "@/lib/utils";

type Props = { client: ClientRow };

const ClientBillingPaymentCell: FC<Props> = ({ client }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [payOpen, setPayOpen] = useState(false);
    const inactive = client.status === 0;
    const totalDue = client.invoiceDue?.reduce((acc, curr) => acc + curr.total_amount, 0);
    const dueAmount = totalDue && totalDue > 0 ? totalDue : 0;
    const canPay = hasPermission("invoices.pay");

    return (
        <div className="flex flex-col gap-0.5 min-w-[120px]">
            <div className="flex items-center gap-1">
                <span className={cn("font-semibold text-sm capitalize", inactive && "text-destructive")}>
                    {t("client.table.total_due")}: <DisplayCount amount={dueAmount} formatCurrency />
                </span>
                {canPay && dueAmount > 0 && (
                    <MyButton
                        action="edit"
                        icon={false}
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => setPayOpen(true)}
                        tooltip="client.actions.pay"
                        aria-label={t("client.actions.pay")}
                    >
                        <CreditCard className="h-3.5 w-3.5" />
                    </MyButton>
                )}
            </div>
            <span className={cn("text-sm capitalize", inactive && "text-destructive")}>
                {client.billing_term || "—"}
            </span>
            <span className={cn("text-xs text-muted-foreground")}>
                {t("client.table.deadline")}: {client.payment_deadline || "—"}
            </span>
            {canPay && (
                <LazyBulkInvoicePayDialog
                    invoiceDue={client.invoiceDue ?? []}
                    open={payOpen}
                    onOpenChange={setPayOpen}
                />
            )}
        </div>
    );
};

export default ClientBillingPaymentCell;

"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ClientRow } from "./client-type";
import DisplayCount from "../display-count";

type Props = { client: ClientRow };

const ClientBillingPaymentCell: FC<Props> = ({ client }) => {
    const { t } = useTranslation();
    const inactive = client.status === 0;
    const totalDue = client.invoiceDue?.reduce((acc, curr) => acc + curr.total_amount, 0);

    return (
        <div className="flex flex-col gap-0.5 min-w-[120px]">
            {totalDue && totalDue > 0 ? (
                <span className={cn("font-semibold text-sm capitalize", inactive && "text-destructive")}>
                    {t("client.table.total_due")}: {<DisplayCount amount={totalDue} formatCurrency />}
                </span>
            ) : (
                <span className={cn("font-semibold text-sm capitalize", inactive && "text-destructive")}>
                    {t("client.table.total_due")}: {<DisplayCount amount={0} formatCurrency />}
                </span>
            )}
            <span className={cn("text-sm capitalize", inactive && "text-destructive")}>
                {client.billing_term || "—"}
            </span>
            <span className={cn("text-xs text-muted-foreground")}>
                {t("client.table.deadline")}: {client.payment_deadline || "—"}
            </span>
        </div>
    );
};

export default ClientBillingPaymentCell;

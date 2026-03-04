"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ClientRow } from "./client-type";

type Props = { client: ClientRow };

const ClientBillingPaymentCell: FC<Props> = ({ client }) => {
    const { t } = useTranslation();
    const inactive = client.status === 0;

    return (
        <div className="flex flex-col gap-0.5 min-w-[120px]">
            <span className={cn("font-semibold text-sm capitalize", inactive && "text-destructive")}>
                {client.billing_term || "—"}
            </span>
            <span className={cn("text-sm", inactive ? "text-destructive/80" : "text-foreground")}>
                {t("client.table.deadline")}: {client.payment_deadline || "—"}
            </span>
            {client.discount && client.discount !== "0" && (
                <span className={cn("text-xs", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                    {t("client.discount.label")}: {client.discount}
                </span>
            )}
        </div>
    );
};

export default ClientBillingPaymentCell;

"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ClientRow } from "@/components/clients/client-type";
import {
    ClientTerminationDateDisplay,
    getClientTerminationDateDisplay,
} from "@/components/clients/client-termination-date";
import DisplayCount from "@/components/display-count";
import { toNumber } from "@/lib/helper/helper";

type Props = { client: ClientRow };

const ClientPackageCell: FC<Props> = ({ client }) => {
    const { t } = useTranslation();
    const inactive = client.status === 0;
    const termination = getClientTerminationDateDisplay(client.termination_date);
    const expired = termination?.kind === "expired";

    return (
        <div className="flex flex-col gap-0.5 min-w-[130px]">
            <span className={cn("font-semibold text-sm whitespace-nowrap", (inactive || expired) && "text-destructive")}>
                {terminationText(termination, (key, count) => t(key, { count }))}
            </span>
            <span className={cn("text-sm", inactive ? "text-destructive/80" : "text-foreground")}>
                {client.package?.name || "—"}
            </span>
            <span className={cn("text-xs font-mono", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                {client.package?.price ? <DisplayCount amount={toNumber(client.package.price as string)} formatCurrency /> : "—"}
            </span>
        </div>
    );
};

function terminationText(
    termination: ClientTerminationDateDisplay | null,
    translate: (key: string, count: number) => string,
): string {
    if (!termination) return "—";
    if (termination.kind === "unparsed") return termination.text;

    const suffixKey = termination.kind === "expired"
        ? "client.table.termination_expired_days"
        : "client.table.termination_days";

    return `${termination.date} ${translate(suffixKey, termination.days)}`;
}

export default ClientPackageCell;

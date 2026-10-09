"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { format, isToday } from "date-fns";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { usePermissions } from "@/context/app-provider";
import { formatDbm, toDate } from "@/components/monitoring/monitoring-format";
import { cn } from "@/lib/utils";
import { OltAttentionItem } from "./olt-type";

const ClientTicketDialog = dynamic(() => import("@/components/clients/client-ticket"), { ssr: false });

// Signal-strength warnings are amber; everything that cuts the client off is red.
const AMBER_REASONS = new Set(["near_limit", "too_strong"]);

interface Props {
    items: OltAttentionItem[];
    className?: string;
}

export default function OltAttention({ items, className }: Props) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [ticketClient, setTicketClient] = useState<OltAttentionItem["client"] | null>(null);
    const canShowClient = hasPermission("clients.show");
    const canCreateTicket = hasPermission("tickets.create");

    const since = (value: string | null) => {
        const date = toDate(value);
        if (!date) return "—";
        return t("olt.attention.since", { time: format(date, isToday(date) ? "HH:mm" : "dd MMM") });
    };

    return (
        <Card className={cn("overflow-hidden", className)}>
            <h2 className="border-b bg-muted/60 px-3.5 py-2.5 text-sm font-semibold">
                {t("olt.attention.title", { count: items.length })}
            </h2>
            {items.length === 0 ? (
                <p className="px-3.5 py-8 text-center text-sm text-muted-foreground">{t("olt.attention.empty")}</p>
            ) : (
                <ul>
                    {items.map((item, index) => {
                        const amber = AMBER_REASONS.has(item.reason);
                        const dbm = item.rx_power_dbm != null ? formatDbm(item.rx_power_dbm) : "";
                        return (
                            <li
                                key={`${item.client.id}-${index}`}
                                className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b px-3.5 py-2.5 last:border-b-0"
                            >
                                <div className="min-w-0 flex-[1_1_220px]">
                                    {canShowClient ? (
                                        <Link href={`/clients/view/${item.client.id}`} className="font-semibold hover:underline">
                                            {item.client.name}
                                        </Link>
                                    ) : (
                                        <span className="font-semibold">{item.client.name}</span>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                        {[item.client.pppoe_username, item.client.phone, item.onu?.name].filter(Boolean).join(" · ")}
                                    </div>
                                </div>
                                <MyBadge
                                    type={amber ? "warning" : "decline"}
                                    variant="soft"
                                    size="sm"
                                    icon={false}
                                    className={amber ? "text-amber-800 dark:text-amber-300" : undefined}
                                >
                                    {t(`olt.attention.reason.${item.reason}`, { dbm }).trim()}
                                </MyBadge>
                                <span className="w-28 text-sm tabular-nums text-muted-foreground">{since(item.since)}</span>
                                {canCreateTicket && (
                                    <MyButton type="button" variant="outline" onClick={() => setTicketClient(item.client)}>
                                        {t("olt.attention.create_ticket")}
                                    </MyButton>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {ticketClient && (
                <ClientTicketDialog
                    client={{ id: ticketClient.id, uuid: ticketClient.id, name: ticketClient.name }}
                    clientUuid={ticketClient.id}
                    open
                    onOpenChange={(open) => !open && setTicketClient(null)}
                />
            )}
        </Card>
    );
}

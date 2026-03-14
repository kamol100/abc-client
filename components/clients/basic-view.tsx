"use client";

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Phone } from "lucide-react";
import { toast } from "react-toastify";
import Card from "@/components/card";
import { ClientRow } from "./client-type";
import ClientRouterInfo from "./client-router-info";
import { formatMoney } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";

/** Client detail row shape with API passthrough fields (wallet, package price, etc.). */
type ClientDetail = ClientRow & {
    pppoe_password?: string | null;
    wallet?: { balance?: number } | null;
    package?: { name?: string; price?: number } | null;
    billing_type?: string | null;
    invoice_day?: string | null;
};

interface Props {
    client: ClientDetail;
}

const InfoRow: FC<{ label: string; labelWidth?: string; children: React.ReactNode }> = ({
    label,
    labelWidth = "w-28",
    children,
}) => (
    <div className="flex items-start gap-2 py-1.5 text-sm">
        <span className={cn("shrink-0 font-medium text-muted-foreground", labelWidth)}>{label}</span>
        <span className="shrink-0 font-medium text-foreground">:</span>
        <span className="min-w-0 break-words text-foreground">{children}</span>
    </div>
);

const ClientBasicView: FC<Props> = ({ client }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const textToCopy = [
        `Name: ${client?.name ?? ""}`,
        `Phone: ${client?.phone ?? ""}`,
        `UserId: ${client?.pppoe_username ?? ""}`,
        `Password: ${client?.pppoe_password ?? ""}`,
        `Zone: ${client?.zone?.name ?? ""}`,
        `Address: ${client?.current_address ?? ""}`,
    ]
        .join("\n")
        .trim();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast.success(t("client.basic_view.copy_success"));
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t("common.request_failed"));
        }
    };

    const balance = client?.wallet?.balance ?? 0;
    const packagePrice = client?.package && "price" in client.package ? (client.package as { price?: number }).price : undefined;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2.5">
                    <h2 className="text-base font-semibold text-foreground">
                        {t("client.basic_view.basic_information")}
                    </h2>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                            "rounded p-1.5 transition-colors hover:bg-muted",
                            copied && "text-primary",
                        )}
                        aria-label={t("client.basic_view.copy")}
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                </div>
                <div className="space-y-0 px-3 py-3">
                    <InfoRow label={t("common.name")}>{client?.name ?? "—"}</InfoRow>
                    <InfoRow label={t("common.phone")}>
                        {client?.phone ? (
                            <a
                                href={`tel:${client.phone}`}
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                {client.phone}
                            </a>
                        ) : (
                            "—"
                        )}
                    </InfoRow>
                    <InfoRow label={t("client.basic_view.username")}>{client?.pppoe_username ?? "—"}</InfoRow>
                    <InfoRow label={t("common.password")}>{client?.pppoe_password ?? "—"}</InfoRow>
                    <InfoRow label={t("client.zone.label")}>{client?.zone?.name ?? "—"}</InfoRow>
                    <InfoRow label={t("client.basic_view.address")}>{client?.current_address ?? "—"}</InfoRow>
                    <InfoRow label={t("common.email")}>{client?.email ?? "—"}</InfoRow>
                    <InfoRow label={t("client.basic_view.balance")}>
                        ৳{formatMoney(balance)}/- {t("client.basic_view.tk")}
                    </InfoRow>
                </div>
            </Card>

            <Card>
                <div className="border-b bg-muted/40 px-3 py-2.5">
                    <h2 className="text-base font-semibold text-foreground">
                        {t("client.basic_view.billing_information")}
                    </h2>
                </div>
                <div className="space-y-0 px-3 py-3">
                    <InfoRow labelWidth="w-36" label={t("client.basic_view.connection_type")}>
                        PPPOE
                    </InfoRow>
                    <InfoRow labelWidth="w-36" label={t("client.package.label")}>
                        {client?.package?.name ?? "—"}
                    </InfoRow>
                    <InfoRow labelWidth="w-36" label={t("client.basic_view.price")}>
                        {packagePrice != null ? `৳${formatMoney(packagePrice)}/- ${t("client.basic_view.tk")}` : "—"}
                    </InfoRow>
                    <InfoRow labelWidth="w-36" label={t("client.basic_view.billing_deadline")}>
                        {client?.payment_deadline ?? "—"}
                    </InfoRow>
                    <InfoRow labelWidth="w-36" label={t("client.basic_view.billing_term")}>
                        {client?.billing_term ? t(`common.${client.billing_term}`) : t("common.monthly")}
                    </InfoRow>
                    <InfoRow labelWidth="w-36" label={t("client.basic_view.invoice_day")}>
                        {client?.invoice_day ?? "—"}
                    </InfoRow>
                    <InfoRow labelWidth="w-36" label={t("client.basic_view.billing_type")}>
                        {client?.billing_type ?? "—"}
                    </InfoRow>
                    <InfoRow labelWidth="w-36" label={t("client.discount.label")}>
                        {client?.discount ?? "—"}
                    </InfoRow>
                </div>
            </Card>

            <Card>
                <div className="border-b bg-muted/40 px-3 py-2.5">
                    <h2 className="text-base font-semibold text-foreground">
                        {t("client.basic_view.server_information")}
                    </h2>
                </div>
                <ClientRouterInfo client={client} />
            </Card>
        </div>
    );
};

export default ClientBasicView;

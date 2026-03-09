"use client";

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    CreditCard,
    Edit,
    FileText,
    Loader2,
    MessageSquare,
    Package,
    Ticket,
} from "lucide-react";
import Link from "next/link";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { usePermissions } from "@/context/app-provider";
import ActionButton from "@/components/action-button";
import { ClientRow, RouterInfo } from "./client-type";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Card from "@/components/card";
import { Badge } from "@/components/ui/badge";
import ClientNamePhoneCell from "./client-name-phone-cell";
import ClientZoneAddressCell from "./client-zone-address-cell";
import ClientPackageCell from "./client-package-cell";
import ClientBillingPaymentCell from "./client-billing-payment-cell";
import ClientOnlineStatusCell from "./client-online-status-cell";
import ClientSpeedWidget from "./client-speed-widget";
import ClientHistory from "./client-history";
import ClientBasicView from "./basic-view";
import BulkInvoicePayDialog from "@/components/invoices/bulk-invoice-pay-dialog";
import ClientChangePackageDialog from "./client-change-package-dialog";
import TicketTable from "../tickets/ticket-table";
import PaymentTable from "../payments/payment-table";
import { cn } from "@/lib/utils";

interface Props {
    clientId: string;
}

const ClientView: FC<Props> = ({ clientId }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [changePackageOpen, setChangePackageOpen] = useState(false);
    const [bulkPayOpen, setBulkPayOpen] = useState(false);

    const { data, isLoading } = useApiQuery<ApiResponse<ClientRow>>({
        queryKey: ["clients", "detail", clientId],
        url: `clients/${clientId}`,
        pagination: false,
    });

    const client = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!client) return null;

    const isActive = client.status === 1;

    return (
        <div className="space-y-6 overflow-auto pr-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <ActionButton variant="default" size="icon" url="/clients">
                        <ArrowLeft className="h-4 w-4" />
                    </ActionButton>
                    <h1 className="text-lg font-semibold">{t("client.view_title")}</h1>
                    <Badge variant={isActive ? "default" : "destructive"}>
                        {isActive ? t("common.active") : t("common.inactive")}
                    </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    {hasPermission("clients.edit") && (
                        <ActionButton action="edit" url={`/clients/edit/${client.id}`} title={t("client.actions.edit")} />
                    )}
                    <ActionButton action="edit" icon={false} onClick={() => setChangePackageOpen(true)}>
                        <Package className="h-4 w-4" />
                        {t("client.actions.change_package")}
                    </ActionButton>
                    {hasPermission("invoices.access") && (
                        <ActionButton action="edit" icon={false} url={`/invoices/client/${client.id}`}>
                            <FileText className="h-4 w-4" />
                            {t("client.actions.invoice_history")}
                        </ActionButton>
                    )}
                    {hasPermission("invoices.pay") && (
                        <ActionButton action="edit" icon={false} onClick={() => setBulkPayOpen(true)}>
                            <CreditCard className="h-4 w-4" />
                            {t("client.actions.pay")}
                        </ActionButton>
                    )}
                    {hasPermission("tickets.create") && (
                        <ActionButton action="edit" icon={false} url={`/tickets?client_id=${client.id}`}>
                            <Ticket className="h-4 w-4" />
                            {t("client.actions.tickets")}
                        </ActionButton>
                    )}
                    {hasPermission("sms-send.access") && client.phone && (
                        <ActionButton action="edit" icon={false} url={`/sms-send?phone=${client.phone}`}>
                            <MessageSquare className="h-4 w-4" />
                            {t("client.actions.sms")}
                        </ActionButton>
                    )}
                </div>
            </div>

            <div className="w-full">
                <ClientBasicView
                    client={client as ClientRow & { pppoe_password?: string | null; wallet?: { balance?: number }; package?: { name?: string; price?: number }; billing_type?: string | null; invoice_day?: string | null }}
                    clientId={clientId}
                    routerInfo={(client as ClientRow & { router_info?: RouterInfo }).router_info}
                />
            </div>
            <div className="border-t pt-4">
                <PaymentTable filterValue={`client_uuid=${clientId}`} />
            </div>
            <div className="border-t pt-4">
                <TicketTable filterValue={`client_uuid=${clientId}`} />
            </div>

            <div className="border-t pt-4">
                <ClientHistory clientId={clientId} />
            </div>

            <ClientChangePackageDialog
                client={client}
                open={changePackageOpen}
                onOpenChange={setChangePackageOpen}
            />

            <BulkInvoicePayDialog
                clientId={client.id}
                invoiceDue={client.invoiceDue ?? []}
                open={bulkPayOpen}
                onOpenChange={setBulkPayOpen}
            />
        </div>
    );
};

export default ClientView;

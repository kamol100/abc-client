"use client";

import { FC, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    CreditCard,
    MessageSquare,
    Package,
    Ticket,
} from "lucide-react";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { usePermissions } from "@/context/app-provider";
import MyButton from "@/components/my-button";
import { ClientRow, getClientId } from "@/components/clients/client-type";
import { Badge } from "@/components/ui/badge";
import ClientHistory from "@/components/clients/client-history";
import ClientBasicView from "@/components/clients/basic-view";
import ClientViewSkeleton from "@/components/clients/client-view-skeleton";
import BulkInvoicePayDialog from "@/components/invoices/bulk-invoice-pay-dialog";
import ClientChangePackageDialog from "@/components/clients/client-change-package-dialog";
import TicketTable from "@/components/tickets/ticket-table";
import PaymentTable from "@/components/payments/payment-table";
import InvoiceTable from "@/components/invoices/invoice-table";

const ClientSmsDialog = dynamic(() => import("@/components/clients/client-sms"), { ssr: false });
const ClientTicketDialog = dynamic(() => import("@/components/clients/client-ticket"), { ssr: false });

interface Props {
    clientId: string;
}

const ClientView: FC<Props> = ({ clientId }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [changePackageOpen, setChangePackageOpen] = useState(false);
    const [bulkPayOpen, setBulkPayOpen] = useState(false);
    const [smsOpen, setSmsOpen] = useState(false);
    const [ticketOpen, setTicketOpen] = useState(false);
    const { data, isLoading } = useApiQuery<ApiResponse<ClientRow>>({
        queryKey: ["clients", "detail", clientId],
        url: `clients/${clientId}`,
        pagination: false,
    });

    const client = data?.data;

    if (isLoading) {
        return <ClientViewSkeleton />;
    }

    if (!client) return null;

    const isActive = client.status === 1;

    return (
        <div className="space-y-6 overflow-auto pr-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <MyButton variant="default" size="icon" url="/clients">
                        <ArrowLeft className="h-4 w-4" />
                    </MyButton>
                    <h1 className="text-lg font-semibold">{t("client.view_title")}</h1>
                    <Badge variant={isActive ? "default" : "destructive"}>
                        {isActive ? t("common.active") : t("common.inactive")}
                    </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    {hasPermission("clients.edit") && (
                        <MyButton action="edit" url={`/clients/edit/${getClientId(client) ?? clientId}`} title={t("client.actions.edit")} />
                    )}
                    <MyButton action="edit" icon={false} onClick={() => setChangePackageOpen(true)}>
                        <Package className="h-4 w-4" />
                        {t("client.actions.change_package")}
                    </MyButton>
                    {hasPermission("invoices.pay") && (
                        <MyButton action="edit" icon={false} onClick={() => setBulkPayOpen(true)}>
                            <CreditCard className="h-4 w-4" />
                            {t("client.actions.pay")}
                        </MyButton>
                    )}
                    {hasPermission("tickets.create") && (
                        <MyButton action="edit" icon={false} onClick={() => setTicketOpen(true)}>
                            <Ticket className="h-4 w-4" />
                            {t("client.actions.tickets")}
                        </MyButton>
                    )}
                    {hasPermission("sms-send.access") && client.phone && (
                        <MyButton action="edit" icon={false} onClick={() => setSmsOpen(true)}>
                            <MessageSquare className="h-4 w-4" />
                            {t("client.actions.sms")}
                        </MyButton>
                    )}
                </div>
            </div>
            <ClientSmsDialog
                client={client}
                open={smsOpen}
                onOpenChange={setSmsOpen}
            />
            <ClientTicketDialog
                client={client}
                clientUuid={clientId}
                open={ticketOpen}
                onOpenChange={setTicketOpen}
            />

            <div className="w-full">
                <ClientBasicView
                    client={client as ClientRow}
                />
            </div>
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('invoice.title_plural')}:</div>
                <InvoiceTable filterValue={`client_uuid=${clientId}`} tableToolBar={false} reportsToolbar={false} />
            </div>
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('payment.title_plural')}:</div>
                <PaymentTable filterValue={`client_uuid=${clientId}`} tableToolBar={false} />
            </div>
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('ticket.title_plural')}:</div>
                <TicketTable filterValue={`client_uuid=${clientId}`} tableToolBar={false} />
            </div>

            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('client.history.title')}:</div>
                <ClientHistory clientId={clientId} />
            </div>

            <ClientChangePackageDialog
                client={client}
                open={changePackageOpen}
                onOpenChange={setChangePackageOpen}
            />

            <BulkInvoicePayDialog
                invoiceDue={client.invoiceDue ?? []}
                open={bulkPayOpen}
                onOpenChange={setBulkPayOpen}
            />
        </div>
    );
};

export default ClientView;

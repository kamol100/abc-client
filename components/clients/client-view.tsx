"use client";

import { FC, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    CreditCard,
    MessageSquare,
    Package,
    RotateCcw,
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
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import useInView from "@/hooks/use-in-view";
import BulkInvoicePayDialog from "@/components/invoices/bulk-invoice-pay-dialog";
import ClientChangePackageDialog from "@/components/clients/client-change-package-dialog";
import ClientSessionResetDialog from "@/components/clients/client-session-reset-dialog";
import TicketTable from "@/components/tickets/ticket-table";
import PaymentTable from "@/components/payments/payment-table";
import InvoiceTable from "@/components/invoices/invoice-table";
import ClientOnuSection from "@/components/clients/client-onu-section";
import { ClientIpPingButton } from "@/components/clients/client-router-info";
import type { OnuSummary } from "@/components/onu/onu-type";

const ClientSmsDialog = dynamic(() => import("@/components/clients/client-sms"), { ssr: false });
const ClientTicketDialog = dynamic(() => import("@/components/clients/client-ticket"), { ssr: false });

interface Props {
    clientId: string;
}

function DeferredSection({ children }: { children: ReactNode }) {
    const { ref, inView } = useInView({ rootMargin: "640px", triggerOnce: true });

    return (
        <div ref={ref}>
            {inView ? children : <DataTableSkeleton rows={4} columns={5} />}
        </div>
    );
}

const ClientView: FC<Props> = ({ clientId }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [resetOpen, setResetOpen] = useState(false);
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

    if (!isLoading && !client) return null;

    const isActive = client?.status === 1;

    return (
        <div className="space-y-6 overflow-auto pr-3">
            {!client ? <ClientViewSkeleton showTables={false} /> : (
            <>
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
                        <MyButton
                            action="edit"
                            size="icon"
                            url={`/clients/edit/${getClientId(client) ?? clientId}`}
                            tooltip="client.actions.edit"
                            aria-label={t("client.actions.edit")}
                        />
                    )}
                    <MyButton
                        action="edit"
                        icon={false}
                        size="icon"
                        onClick={() => setResetOpen(true)}
                        tooltip="client.actions.reset_session"
                        aria-label={t("client.actions.reset_session")}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </MyButton>
                    <MyButton
                        action="edit"
                        icon={false}
                        size="icon"
                        onClick={() => setChangePackageOpen(true)}
                        tooltip="client.actions.change_package"
                        aria-label={t("client.actions.change_package")}
                    >
                        <Package className="h-4 w-4" />
                    </MyButton>
                    {hasPermission("invoices.pay") && (
                        <MyButton
                            action="edit"
                            icon={false}
                            size="icon"
                            onClick={() => setBulkPayOpen(true)}
                            tooltip="client.actions.pay"
                            aria-label={t("client.actions.pay")}
                        >
                            <CreditCard className="h-4 w-4" />
                        </MyButton>
                    )}
                    {hasPermission("tickets.create") && (
                        <MyButton
                            action="edit"
                            icon={false}
                            size="icon"
                            onClick={() => setTicketOpen(true)}
                            tooltip="client.actions.tickets"
                            aria-label={t("client.actions.tickets")}
                        >
                            <Ticket className="h-4 w-4" />
                        </MyButton>
                    )}
                    {hasPermission("sms-send.access") && client.phone && (
                        <MyButton
                            action="edit"
                            icon={false}
                            size="icon"
                            onClick={() => setSmsOpen(true)}
                            tooltip="client.actions.sms"
                            aria-label={t("client.actions.sms")}
                        >
                            <MessageSquare className="h-4 w-4" />
                        </MyButton>
                    )}
                    <ClientIpPingButton clientId={getClientId(client) ?? clientId} />
                </div>
            </div>
            <ClientSessionResetDialog
                clientId={getClientId(client) ?? clientId}
                open={resetOpen}
                onOpenChange={setResetOpen}
            />
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
            {hasPermission("onus.access") && (client.onus?.length ?? 0) > 0 && (
                <ClientOnuSection
                    onus={(client.onus ?? []) as unknown as OnuSummary[]}
                    client={{ id: getClientId(client) ?? clientId, name: client.name }}
                />
            )}

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
            </>
            )}
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('invoice.title_plural')}:</div>
                <DeferredSection>
                    <InvoiceTable filterValue={`client_uuid=${clientId}`} tableToolBar={false} reportsToolbar={false} />
                </DeferredSection>
            </div>
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('payment.title_plural')}:</div>
                <DeferredSection>
                    <PaymentTable filterValue={`client_uuid=${clientId}`} tableToolBar={false} />
                </DeferredSection>
            </div>
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('ticket.title_plural')}:</div>
                <DeferredSection>
                    <TicketTable filterValue={`client_uuid=${clientId}`} tableToolBar={false} />
                </DeferredSection>
            </div>
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('client.history.title')}:</div>
                <DeferredSection>
                    <ClientHistory clientId={clientId} />
                </DeferredSection>
            </div>
        </div>
    );
};

export default ClientView;

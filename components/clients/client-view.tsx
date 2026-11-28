"use client";

import { FC, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    CreditCard,
    FilePlus,
    MapPin,
    MessageSquare,
    Package,
    RotateCcw,
    Ticket,
} from "lucide-react";
import { useClientDetail } from "@/components/clients/client-detail-query";
import { cn } from "@/lib/utils";
import { usePermissions, useProfile } from "@/context/app-provider";
import MyButton from "@/components/my-button";
import { ClientRow, getClientId } from "@/components/clients/client-type";
import { Badge } from "@/components/ui/badge";
import ClientHistory from "@/components/clients/client-history";
import ClientLockDialog, { useCanLockClients } from "@/components/clients/client-lock-dialog";
import ClientBasicView from "@/components/clients/basic-view";
import ClientViewSkeleton from "@/components/clients/client-view-skeleton";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import useInView from "@/hooks/use-in-view";
import BulkInvoicePayDialog from "@/components/invoices/bulk-invoice-pay-dialog";
import ClientChangePackageDialog from "@/components/clients/client-change-package-dialog";
import ClientSwitchDialog from "@/components/clients/client-switch-dialog";
import ClientSessionResetDialog from "@/components/clients/client-session-reset-dialog";
import TicketTable from "@/components/tickets/ticket-table";
import PaymentTable from "@/components/payments/payment-table";
import InvoiceTable from "@/components/invoices/invoice-table";
import ClientProductTable from "@/components/products/client-product-table";
import ClientOnuSection from "@/components/clients/client-onu-section";
import { ClientIpPingButton } from "@/components/clients/client-router-info";
import type { OnuSummary } from "@/components/onu/onu-type";

const ClientSmsDialog = dynamic(() => import("@/components/clients/client-sms"), { ssr: false });
const ClientTicketDialog = dynamic(() => import("@/components/clients/client-ticket"), { ssr: false });
const ClientAddMapDialog = dynamic(() => import("@/components/clients/client-add-map-dialog"), { ssr: false });
const ClientInvoiceCreateDialog = dynamic(() => import("@/components/clients/client-invoice-create-dialog"), { ssr: false });

interface Props {
    clientId: string;
    /** "overlay": inside the modal / drawer, whose top bar replaces the back button. */
    variant?: "page" | "overlay";
    /** The element that scrolls the view when it is not the window (the modal / drawer body). */
    scrollRoot?: Element | null;
}

function DeferredSection({ children, scrollRoot }: { children: ReactNode; scrollRoot?: Element | null }) {
    const { ref, inView } = useInView({ root: scrollRoot ?? null, rootMargin: "640px", triggerOnce: true });

    return (
        <div ref={ref}>
            {inView ? children : <DataTableSkeleton rows={4} columns={5} />}
        </div>
    );
}

const ClientView: FC<Props> = ({ clientId, variant = "page", scrollRoot = null }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { profile } = useProfile();
    const isResellerUser = !!profile?.reseller;
    const canLockClients = useCanLockClients();
    const [resetOpen, setResetOpen] = useState(false);
    const [changePackageOpen, setChangePackageOpen] = useState(false);
    const [bulkPayOpen, setBulkPayOpen] = useState(false);
    const [smsOpen, setSmsOpen] = useState(false);
    const [ticketOpen, setTicketOpen] = useState(false);
    const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
    const canCreateInvoice = hasPermission("invoices.create");
    const [lockOpen, setLockOpen] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const [switchOpen, setSwitchOpen] = useState(false);
    const canAddMap = hasPermission("clients.map.add");
    const canSwitchClient = hasPermission("clients.switch.reseller") && !isResellerUser;
    const { data, isLoading, isPlaceholderData } = useClientDetail(clientId);

    const client = data?.data;
    // The list row lacks detail-only fields; actions wait for the full record.
    const isSummary = isPlaceholderData;

    if (!isLoading && !client) return null;

    // The detail API sends the wallet; the list row type does not have it.
    const walletBalance =
        (client as { wallet?: { balance?: number | string | null } | null } | undefined)?.wallet?.balance ?? 0;
    const isActive = client?.status === 1;
    const isLocked = client?.is_locked === true;

    return (
        <div className={cn("space-y-6", variant === "page" && "overflow-auto pr-3")}>
            {!client ? <ClientViewSkeleton showTables={false} variant={variant} /> : (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            {variant === "page" && (
                                <MyButton variant="default" size="icon" url="/clients">
                                    <ArrowLeft className="h-4 w-4" />
                                </MyButton>
                            )}
                            <h1 className="text-lg font-semibold">{t("client.view_title")}</h1>
                            <Badge variant={isActive ? "default" : "destructive"}>
                                {isActive ? t("common.active") : t("common.inactive")}
                            </Badge>
                        </div>
                        <fieldset
                            disabled={isSummary}
                            aria-busy={isSummary}
                            className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto"
                        >
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
                            {hasPermission("clients.edit") && (
                                <MyButton
                                    action="edit"
                                    size="icon"
                                    url={`/clients/edit/${getClientId(client) ?? clientId}`}
                                    tooltip="client.actions.edit"
                                    aria-label={t("client.actions.edit")}
                                />
                            )}
                            {canSwitchClient && (
                                <MyButton
                                    action="move"
                                    size="icon"
                                    onClick={() => setSwitchOpen(true)}
                                    tooltip="client.actions.client_switch"
                                    aria-label={t("client.actions.client_switch")}
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
                            {canAddMap && (
                                <MyButton
                                    action="edit"
                                    icon={false}
                                    size="icon"
                                    onClick={() => setMapOpen(true)}
                                    tooltip="client.actions.add_map"
                                    aria-label={t("client.actions.add_map")}
                                >
                                    <MapPin className="h-4 w-4" />
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
                            {canCreateInvoice && (
                                <MyButton
                                    action="edit"
                                    icon={false}
                                    size="icon"
                                    onClick={() => setCreateInvoiceOpen(true)}
                                    tooltip="client.actions.create_invoice"
                                    aria-label={t("client.actions.create_invoice")}
                                >
                                    <FilePlus className="h-4 w-4" />
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
                            {canLockClients && (
                                <MyButton
                                    action={isLocked ? "unlock" : "lock"}
                                    size="icon"
                                    onClick={() => setLockOpen(true)}
                                    tooltip={isLocked ? "client.actions.unlock" : "client.actions.lock"}
                                    aria-label={t(isLocked ? "client.actions.unlock" : "client.actions.lock")}
                                />
                            )}
                            <ClientIpPingButton clientId={getClientId(client) ?? clientId} />
                        </fieldset>
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
                    {canLockClients && (
                        <ClientLockDialog
                            clientId={getClientId(client) ?? clientId}
                            isLocked={isLocked}
                            open={lockOpen}
                            onOpenChange={setLockOpen}
                        />
                    )}
                    <ClientTicketDialog
                        client={client}
                        clientUuid={clientId}
                        open={ticketOpen}
                        onOpenChange={setTicketOpen}
                    />
                    {canCreateInvoice && (
                        <ClientInvoiceCreateDialog
                            client={client}
                            open={createInvoiceOpen}
                            onOpenChange={setCreateInvoiceOpen}
                        />
                    )}

                    <div className="w-full">
                        <ClientBasicView
                            client={client as ClientRow}
                            summaryOnly={isSummary}
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
                    {canSwitchClient && (
                        <ClientSwitchDialog
                            client={client}
                            open={switchOpen}
                            onOpenChange={setSwitchOpen}
                        />
                    )}
                    {canAddMap && (
                        <ClientAddMapDialog
                            clientId={getClientId(client) ?? clientId}
                            open={mapOpen}
                            onOpenChange={setMapOpen}
                        />
                    )}

                    <BulkInvoicePayDialog
                        invoiceDue={client.invoiceDue ?? []}
                        open={bulkPayOpen}
                        onOpenChange={setBulkPayOpen}
                    />
                </>
            )}
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('invoice.title_plural')}:</div>
                <DeferredSection scrollRoot={scrollRoot}>
                    <InvoiceTable
                        filterValue={`client_uuid=${clientId}`}
                        tableToolBar={false}
                        reportsToolbar={true}
                        advancePayment={walletBalance}
                    />
                </DeferredSection>
            </div>
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('payment.title_plural')}:</div>
                <DeferredSection scrollRoot={scrollRoot}>
                    <PaymentTable filterValue={`client_uuid=${clientId}`} tableToolBar={false} />
                </DeferredSection>
            </div>
            {hasPermission("products-out.report") && (
                <div className="border-t pt-4">
                    <div className="text-md font-semibold mb-2">{t('client.products.title')}:</div>
                    <DeferredSection scrollRoot={scrollRoot}>
                        <ClientProductTable clientUuid={clientId} />
                    </DeferredSection>
                </div>
            )}
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('ticket.title_plural')}:</div>
                <DeferredSection scrollRoot={scrollRoot}>
                    <TicketTable filterValue={`client_uuid=${clientId}`} tableToolBar={false} />
                </DeferredSection>
            </div>
            <div className="border-t pt-4">
                <div className="text-md font-semibold mb-2">{t('client.history.title')}:</div>
                <DeferredSection scrollRoot={scrollRoot}>
                    <ClientHistory clientId={clientId} />
                </DeferredSection>
            </div>
        </div>
    );
};

export default ClientView;

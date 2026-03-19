"use client";

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    CreditCard,
    Edit,
    FileText,
    MessageSquare,
    Package,
    Ticket,
} from "lucide-react";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { usePermissions } from "@/context/app-provider";
import MyButton from "@/components/my-button";
import { ClientRow, RouterInfo } from "./client-type";
import { Badge } from "@/components/ui/badge";
import ClientHistory from "./client-history";
import ClientBasicView from "./basic-view";
import ClientViewSkeleton from "./client-view-skeleton";
import BulkInvoicePayDialog from "@/components/invoices/bulk-invoice-pay-dialog";
import ClientChangePackageDialog from "./client-change-package-dialog";
import TicketTable from "../tickets/ticket-table";
import PaymentTable from "../payments/payment-table";

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
        return <ClientViewSkeleton />;
    }

    if (!client) return null;

    const isActive = client.status === 1;
    console.log(client, 'client', isActive);
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
                        <MyButton action="edit" url={`/clients/edit/${client.id}`} title={t("client.actions.edit")} />
                    )}
                    <MyButton action="edit" icon={false} onClick={() => setChangePackageOpen(true)}>
                        <Package className="h-4 w-4" />
                        {t("client.actions.change_package")}
                    </MyButton>
                    {hasPermission("invoices.access") && (
                        <MyButton action="edit" icon={false} url={`/invoices/client/${client.id}`}>
                            <FileText className="h-4 w-4" />
                            {t("client.actions.invoice_history")}
                        </MyButton>
                    )}
                    {hasPermission("invoices.pay") && (
                        <MyButton action="edit" icon={false} onClick={() => setBulkPayOpen(true)}>
                            <CreditCard className="h-4 w-4" />
                            {t("client.actions.pay")}
                        </MyButton>
                    )}
                    {hasPermission("tickets.create") && (
                        <MyButton action="edit" icon={false} url={`/tickets?client_id=${client.id}`}>
                            <Ticket className="h-4 w-4" />
                            {t("client.actions.tickets")}
                        </MyButton>
                    )}
                    {hasPermission("sms-send.access") && client.phone && (
                        <MyButton action="edit" icon={false} url={`/sms-send?phone=${client.phone}`}>
                            <MessageSquare className="h-4 w-4" />
                            {t("client.actions.sms")}
                        </MyButton>
                    )}
                </div>
            </div>

            <div className="w-full">
                <ClientBasicView
                    client={client as ClientRow}
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
                invoiceDue={client.invoiceDue ?? []}
                open={bulkPayOpen}
                onOpenChange={setBulkPayOpen}
            />
        </div>
    );
};

export default ClientView;

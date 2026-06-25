"use client";

import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import {
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions, useSettings } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { Row } from "@tanstack/react-table";
import {
    CreditCard,
    Edit,
    Eye,
    FileText,
    MessageSquare,
    Package,
    RotateCcw,
    Ticket,
    Trash2,
    TriangleAlert,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import BulkInvoicePayDialog from "@/components/invoices/bulk-invoice-pay-dialog";
import ClientChangePackageDialog from "@/components/clients/client-change-package-dialog";
import ClientSessionResetDialog from "@/components/clients/client-session-reset-dialog";
import ClientSmsDialog from "@/components/clients/client-sms";
import { ClientRow } from "@/components/clients/client-type";
import dynamic from "next/dynamic";
import { ClientWalletRechargeDialog } from "@/components/wallets/wallet-transaction";

const ClientTicketDialog = dynamic(() => import("@/components/clients/client-ticket"), { ssr: false });

interface ClientRowActionsProps {
    row: Row<ClientRow>;
}

const ClientRowActions: FC<ClientRowActionsProps> = ({ row }) => {
    const { t } = useTranslation();
    const { settings: { client_view_open_on_new_tab, client_edit_open_on_new_tab } } = useSettings();
    const { hasPermission } = usePermissions();
    const [ticketOpen, setTicketOpen] = useState(false);
    const client = row.original;
    const [resetOpen, setResetOpen] = useState(false);
    const [changePackageOpen, setChangePackageOpen] = useState(false);
    const [bulkPayOpen, setBulkPayOpen] = useState(false);
    const [smsOpen, setSmsOpen] = useState(false);
    const [walletRechargeOpen, setWalletRechargeOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [mikrotikDelete, setMikrotikDelete] = useState(false);

    const { mutateAsync: deleteClient, isPending: isDeleting } = useApiMutation({
        url: mikrotikDelete
            ? `/clients/${client.id}?mikrotik_delete=true`
            : `/clients/${client.id}`,
        method: "DELETE",
        invalidateKeys: "clients",
        successMessage: "common.item_deleted_successfully",
        defaultErrorMessage: "common.delete_failed",
    });

    const handleDelete = async (close: () => void) => {
        await deleteClient();
        close();
    };

    const handleDeleteOpenChange = (open: boolean) => {
        setDeleteOpen(open);
        if (!open) setMikrotikDelete(false);
    };

    return (
        <div className="w-full">
            <DataTableRowActions row={row}>
                {hasPermission("clients.show") && (
                    <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link target={client_view_open_on_new_tab ? "_blank" : "_self"} href={`/clients/view/${client.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("client.actions.view")}
                        </Link>
                    </DropdownMenuItem>
                )}
                {hasPermission("clients.edit") && (
                    <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link target={client_edit_open_on_new_tab ? "_blank" : "_self"} href={`/clients/edit/${client.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("client.actions.edit")}
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => setResetOpen(true)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t("client.actions.reset_session")}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setChangePackageOpen(true)}>
                    <Package className="mr-2 h-4 w-4" />
                    {t("client.actions.change_package")}
                </DropdownMenuItem>
                {hasPermission("invoices.access") && (
                    <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link href={`/invoices/client/${client.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t("client.actions.invoice_history")}
                        </Link>
                    </DropdownMenuItem>
                )}
                {hasPermission("invoices.pay") && (
                    <DropdownMenuItem onSelect={() => setBulkPayOpen(true)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t("client.actions.pay")}
                    </DropdownMenuItem>
                )}
                {hasPermission("sms-send.access") && client.phone && (
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() => setSmsOpen(true)}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {t("client.actions.sms")}
                    </DropdownMenuItem>
                )}
                {hasPermission("tickets.create") && (
                    <DropdownMenuItem className="cursor-pointer" onSelect={() => setTicketOpen(true)}>
                        <Ticket className="mr-2 h-4 w-4" />
                        {t("client.actions.tickets")}
                    </DropdownMenuItem>
                )}
                {hasPermission("wallets.access") && (
                    <DropdownMenuItem onSelect={() => setWalletRechargeOpen(true)}>
                        <Wallet className="mr-2 h-4 w-4" />
                        {t("client.actions.wallet_recharge")}
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {hasPermission("clients.delete") && (
                    <DropdownMenuItem
                        onSelect={() => setDeleteOpen(true)}
                        className="text-destructive cursor-pointer focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("client.actions.delete")}
                    </DropdownMenuItem>
                )}
            </DataTableRowActions>

            <ClientSessionResetDialog
                clientId={client.id}
                open={resetOpen}
                onOpenChange={setResetOpen}
            />

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

            <ClientSmsDialog
                client={client}
                open={smsOpen}
                onOpenChange={setSmsOpen}
            />
            <ClientTicketDialog
                client={client}
                clientUuid={client.uuid}
                open={ticketOpen}
                onOpenChange={setTicketOpen}
            />

            <ClientWalletRechargeDialog
                clientUuid={client.id}
                clientName={client.name}
                open={walletRechargeOpen}
                onOpenChange={setWalletRechargeOpen}
            />

            <MyDialog
                open={deleteOpen}
                onOpenChange={handleDeleteOpenChange}
                size="sm"
                loading={isDeleting}
                footer={({ close, loading }) => (
                    <>
                        <MyButton
                            action="cancel"
                            variant="outline"
                            size="default"
                            onClick={close}
                            disabled={loading}
                            title={t("common.cancel")}
                        />
                        <MyButton
                            action="delete"
                            variant="default"
                            size="default"
                            onClick={() => handleDelete(close)}
                            disabled={loading}
                            loading={loading}
                            title={t("common.delete")}
                        />
                    </>
                )}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <TriangleAlert className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-center">
                            {t("common.confirm_delete")}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            {t("client.delete_confirmation")}
                        </DialogDescription>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            checked={mikrotikDelete}
                            onCheckedChange={(checked) =>
                                setMikrotikDelete(checked === true)
                            }
                        />
                        <span className="text-sm text-muted-foreground">
                            {t("client.delete_mikrotik")}
                        </span>
                    </label>
                </div>
            </MyDialog>
        </div>
    );
};

export default ClientRowActions;

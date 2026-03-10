"use client";

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import ActionButton from "@/components/action-button";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import type { InvoiceRow } from "@/components/invoices/invoice-type";
import { CreditCard, Printer } from "lucide-react";
import InvoicePayDialog from "@/components/invoices/invoice-pay-dialog";
import InvoicePrintDialog from "@/components/invoices/invoice-print-dialog";

type InvoiceRowActionsProps = {
    invoice: InvoiceRow;
};

const InvoiceRowActions: FC<InvoiceRowActionsProps> = ({ invoice }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [payOpen, setPayOpen] = useState(false);
    const [printOpen, setPrintOpen] = useState(false);
    const normalizedStatus =
        invoice.status === "partial_paid" ? "partial" : invoice.status;

    const canEdit =
        hasPermission("invoices.edit") &&
        (normalizedStatus === "due" || normalizedStatus === "partial");
    const canPay =
        hasPermission("invoices.pay") &&
        (normalizedStatus === "due" || normalizedStatus === "partial");
    const canPrint =
        hasPermission("invoices.show") &&
        (normalizedStatus === "paid" || normalizedStatus === "partial");
    const canDelete = hasPermission("invoices.delete");
    const hasActions = canEdit || canPay || canPrint || canDelete;

    if (!hasActions) {
        return <div className="text-right text-muted-foreground mr-2">-</div>;
    }

    return (
        <>
            <div className="flex items-center justify-end gap-2 mr-2">
                {canEdit && (
                    <ActionButton
                        variant="outline"
                        url={`/invoices/edit/${invoice.id}`}
                    />
                )}

                {canPay && (
                    <ActionButton
                        variant="outline"
                        onClick={() => setPayOpen(true)}
                        aria-label={t("invoice.actions.pay")}
                    >
                        <CreditCard className="h-4 w-4" />
                    </ActionButton>
                )}

                {canPrint && (
                    <ActionButton
                        variant="outline"
                        onClick={() => setPrintOpen(true)}
                        aria-label={t("invoice.actions.print")}
                    >
                        <Printer className="h-4 w-4" />
                    </ActionButton>
                )}

                {canDelete && (
                    <DeleteModal
                        api_url={`invoices/${invoice.id}`}
                        keys="invoices"
                        confirmMessage="invoice.delete_confirmation"
                        buttonText="invoice.actions.delete"
                    />
                )}
            </div>

            <InvoicePayDialog
                invoiceId={invoice.id}
                open={payOpen}
                onOpenChange={setPayOpen}
            />
            <InvoicePrintDialog
                invoiceId={invoice.id}
                open={printOpen}
                onOpenChange={setPrintOpen}
            />
        </>
    );
};

export default InvoiceRowActions;

"use client";

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import type { InvoiceDetail, InvoiceRow } from "@/components/invoices/invoice-type";
import { CreditCard, Loader2, Printer } from "lucide-react";
import InvoicePrintDialog from "@/components/invoices/invoice-print-dialog";
import dynamic from "next/dynamic";
const BulkInvoicePayDialog = dynamic(() => import("./bulk-invoice-pay-dialog"), { ssr: false });
import { InvoiceDueItem } from "../clients/client-type";
import { useFetch } from "@/app/actions";

type InvoiceRowActionsProps = {
    invoice: InvoiceRow;
};

const InvoiceRowActions: FC<InvoiceRowActionsProps> = ({ invoice }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [payOpen, setPayOpen] = useState(false);
    const [printOpen, setPrintOpen] = useState(false);
    const [invoiceDue, setInvoiceDue] = useState<InvoiceDueItem[]>([]);
    const [loading, setLoading] = useState(false);
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
    console.log(invoice);
    return (
        <>
            <div className="flex items-center justify-end gap-2 mr-2">
                {canEdit && (
                    <MyButton
                        variant="outline"
                        url={`/invoices/edit/${invoice.id}`}
                    />
                )}

                {canPay && (
                    <MyButton
                        variant="outline"
                        onClick={async () => {
                            setLoading(true);
                            const data = await useFetch({
                                url: `/clients/${invoice?.client?.uuid}`,
                            });
                            const invoicesDue = await data?.data?.invoiceDue;
                            setInvoiceDue(invoicesDue);
                            setPayOpen(true);
                            setLoading(false);
                        }}
                        aria-label={t("invoice.actions.pay")}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    </MyButton>
                )}

                {canPrint && (
                    <MyButton
                        variant="outline"
                        onClick={() => setPrintOpen(true)}
                        aria-label={t("invoice.actions.print")}
                    >
                        <Printer className="h-4 w-4" />
                    </MyButton>
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
            {payOpen && (
                <BulkInvoicePayDialog
                    invoiceDue={invoiceDue}
                    open={payOpen}
                    onOpenChange={setPayOpen}
                />)}
            <InvoicePrintDialog
                invoices={[invoice as InvoiceDetail]}
                open={printOpen}
                onOpenChange={setPrintOpen}
            />
        </>
    );
};

export default InvoiceRowActions;

"use client";

import { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MyDialog } from "@/components/my-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import InvoiceForm from "@/components/invoices/invoice-form";
import { ClientRow, getClientId } from "@/components/clients/client-type";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";

/** Shape of `GET /dropdown-clients?uuid=` (ClientController::dropdownList). */
type ClientLookup = {
    id: number;
    name?: string | null;
    phone?: string | null;
    pppoe_username?: string | null;
};

interface ClientInvoiceCreateDialogProps {
    client: ClientRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const InfoItem: FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium" title={value ?? undefined}>
            {value || "—"}
        </p>
    </div>
);

/** Mirrors the embedded invoice form layout so the dialog does not jump when the form mounts. */
const InvoiceFormSkeleton: FC = () => (
    <div className="space-y-4" aria-hidden>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                </div>
            ))}
        </div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-28 w-full lg:col-span-2" />
            <Skeleton className="h-28 w-full" />
        </div>
    </div>
);

const ClientInvoiceCreateDialog: FC<ClientInvoiceCreateDialogProps> = ({
    client,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [formKey, setFormKey] = useState(0);
    // The clients list sends the uuid as `id`; the invoice API needs the numeric id.
    const clientUuid = client.uuid ?? getClientId(client) ?? "";

    const { data, isLoading, isError } = useApiQuery<ApiResponse<ClientLookup | null>>({
        queryKey: ["clients", "invoice-lookup", clientUuid],
        url: "dropdown-clients",
        params: { uuid: clientUuid },
        pagination: false,
        enabled: open && !!clientUuid,
        staleTime: 5 * 60 * 1000,
    });
    const lookup = data?.data ?? null;
    const numericClientId = lookup?.id ? Number(lookup.id) : undefined;

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setFormKey((key) => key + 1);
    };

    const handleSuccess = () => {
        // Client rows carry due invoices (used by the Pay action).
        void queryClient.invalidateQueries({ queryKey: ["clients"] });
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={handleOpenChange}
            title="client.invoice_dialog.title"
            description="client.invoice_dialog.description"
            size="4xl"
            // Fixed height: the centered dialog must not move when the skeleton swaps to the form.
            contentClassName="w-[calc(100vw-2rem)] sm:w-full h-[min(90vh,56rem)]"
        >
            {open && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-3">
                        <InfoItem label={t("client.name.label")} value={client.name || lookup?.name} />
                        <InfoItem
                            label={t("client.pppoe_username.label")}
                            value={client.pppoe_username ?? lookup?.pppoe_username}
                        />
                        <InfoItem label={t("client.phone.label")} value={client.phone ?? lookup?.phone} />
                    </div>

                    {numericClientId ? (
                        <InvoiceForm
                            key={`${numericClientId}-${formKey}`}
                            mode="create"
                            clientId={numericClientId}
                            onClose={() => handleOpenChange(false)}
                            onSuccess={handleSuccess}
                        />
                    ) : isLoading || (!isError && !data) ? (
                        <InvoiceFormSkeleton />
                    ) : (
                        <p className="py-6 text-center text-sm text-destructive">
                            {t("client.invoice_dialog.load_error")}
                        </p>
                    )}
                </div>
            )}
        </MyDialog>
    );
};

export default ClientInvoiceCreateDialog;

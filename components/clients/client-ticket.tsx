"use client";

import { FC, useMemo, useState } from "react";
import { MyDialog } from "@/components/my-dialog";
import type { ClientRow } from "@/components/clients/client-type";
import { useProfile } from "@/context/app-provider";
import TicketForm from "@/components/tickets/ticket-form";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ClientTicketDialogProps {
    client: ClientRow;
    clientUuid?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ClientTicketDialog: FC<ClientTicketDialogProps> = ({
    client,
    clientUuid: providedClientUuid,
    open,
    onOpenChange,
}) => {
    const { profile } = useProfile();
    const [formKey, setFormKey] = useState(0);
    const clientUuid = useMemo(() => {
        if (client.uuid) return client.uuid;
        if (providedClientUuid) return providedClientUuid;

        const clientId = String(client.id);
        return UUID_PATTERN.test(clientId) ? clientId : undefined;
    }, [client.id, client.uuid, providedClientUuid]);

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
            setFormKey((currentKey) => currentKey + 1);
        }
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={handleOpenChange}
            title="client.ticket_dialog.title"
            description="client.ticket_dialog.description"
            size="xl"
            contentClassName="w-[calc(100vw-2rem)] sm:w-full"
        >
            {open && (
                <TicketForm
                    key={formKey}
                    mode="create"
                    embed
                    omitFieldNames={["client_id", "assigned_to"]}
                    defaultValues={{
                        client_uuid: clientUuid,
                        assigned_to_uuid: profile.staff?.id,
                    }}
                    onClose={() => handleOpenChange(false)}
                />
            )}
        </MyDialog>
    );
};

export default ClientTicketDialog;

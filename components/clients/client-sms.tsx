"use client";

import { FC, useState } from "react";
import { MyDialog } from "@/components/my-dialog";
import SmsSentForm from "@/components/sms-sent/sms-sent-form";
import { ClientRow, getClientId } from "@/components/clients/client-type";

interface ClientSmsDialogProps {
    client: ClientRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ClientSmsDialog: FC<ClientSmsDialogProps> = ({
    client,
    open,
    onOpenChange,
}) => {
    const [formKey, setFormKey] = useState(0);
    const phone = client.phone?.trim() ?? "";

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
            title="client.sms_dialog.title"
            description="client.sms_dialog.description"
            size="xl"
            contentClassName="w-[calc(100vw-2rem)] sm:w-full"
        >
            {open && (
                <SmsSentForm
                    key={formKey}
                    mode="singleClient"
                    clientId={getClientId(client) ?? ""}
                    phone={phone}
                    onSent={() => handleOpenChange(false)}
                />
            )}
        </MyDialog>
    );
};

export default ClientSmsDialog;

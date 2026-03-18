"use client";

import ActionButton from "@/components/action-button";
import { MyDialog } from "@/components/my-dialog";
import {
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import useApiMutation from "@/hooks/use-api-mutation";
import { RotateCcw } from "lucide-react";
import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ClientSessionResetDialogProps {
    clientId: number;
    trigger?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const ClientSessionResetDialog: FC<ClientSessionResetDialogProps> = ({
    clientId,
    trigger,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();

    const { mutateAsync, isPending } = useApiMutation({
        url: `/client-reset-session/${clientId}`,
        method: "POST",
        invalidateKeys: "clients",
        successMessage: "client.session_reset.success",
    });

    const handleReset = async (close: () => void) => {
        await mutateAsync();
        close();
    };

    return (
        <MyDialog
            trigger={trigger}
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            loading={isPending}
            footer={({ close, loading }) => (
                <>
                    <ActionButton
                        action="cancel"
                        variant="outline"
                        size="default"
                        onClick={close}
                        disabled={loading}
                        title={t("common.cancel")}
                    />
                    <ActionButton
                        action="save"
                        variant="default"
                        size="default"
                        onClick={() => handleReset(close)}
                        disabled={loading}
                        loading={loading}
                        title={t("common.confirm")}
                    />
                </>
            )}
        >
            <div className="flex flex-col items-center text-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <RotateCcw className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <DialogTitle className="text-center">
                        {t("client.session_reset.title")}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t("client.session_reset.confirm")}
                    </DialogDescription>
                </div>
            </div>
        </MyDialog>
    );
};

export default ClientSessionResetDialog;

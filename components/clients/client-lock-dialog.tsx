"use client";

import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import {
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSettings } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { Lock, Unlock } from "lucide-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export function useCanLockClients(): boolean {
    const { settings } = useSettings();
    return (settings.roles ?? []).some(
        (role) => role === "Admin" || role === "Super Admin",
    );
}

interface ClientLockDialogProps {
    clientId: string;
    isLocked: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ClientLockDialog: FC<ClientLockDialogProps> = ({
    clientId,
    isLocked,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();

    const { mutateAsync: setClientLock, isPending: isLocking } = useApiMutation<
        { is_locked: boolean },
        { is_locked: boolean }
    >({
        url: `/clients/${clientId}/lock`,
        method: "PUT",
        invalidateKeys: "clients,reseller-clients",
        defaultErrorMessage: "client.lock.failed",
        onSuccess: (data) => {
            toast.success(t(data.is_locked ? "client.lock.locked" : "client.lock.unlocked"));
        },
    });

    const handleLock = async (close: () => void) => {
        await setClientLock({ is_locked: !isLocked });
        close();
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            loading={isLocking}
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
                        action={isLocked ? "unlock" : "lock"}
                        variant="default"
                        size="default"
                        onClick={() => handleLock(close)}
                        disabled={loading}
                        loading={loading}
                        title={t(isLocked ? "client.actions.unlock" : "client.actions.lock")}
                    />
                </>
            )}
        >
            <div className="flex flex-col items-center text-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    {isLocked ? (
                        <Unlock className="h-8 w-8 text-foreground" />
                    ) : (
                        <Lock className="h-8 w-8 text-foreground" />
                    )}
                </div>
                <div className="space-y-2">
                    <DialogTitle className="text-center">
                        {t(isLocked ? "client.actions.unlock" : "client.actions.lock")}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t(isLocked ? "client.lock.confirm_unlock" : "client.lock.confirm_lock")}
                    </DialogDescription>
                </div>
            </div>
        </MyDialog>
    );
};

export default ClientLockDialog;

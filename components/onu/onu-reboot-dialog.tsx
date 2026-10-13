"use client";

import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import useApiMutation from "@/hooks/use-api-mutation";
import { onuLabel, type OnuRow } from "./onu-type";

interface Props {
    onu: Pick<OnuRow, "id" | "name" | "label" | "serial" | "mac" | "description">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Confirmation for POST /onus/{id}/reboot (onus.reboot). Errors stay as the hook's toast and keep the dialog open. */
export default function OnuRebootDialog({ onu, open, onOpenChange }: Props) {
    const { t } = useTranslation();
    const { mutateAsync, isPending } = useApiMutation({
        url: `/onus/${onu.id}/reboot`,
        method: "POST",
        invalidateKeys: "onus",
        successMessage: "onu.reboot.success",
        defaultErrorMessage: "onu.reboot.failed",
    });

    const handleReboot = async (close: () => void) => {
        try {
            await mutateAsync();
            close();
        } catch {
            // useApiMutation already showed the API message (refused, OLT error, throttled); stay open.
        }
    };

    // EPON ONUs have a MAC and no serial: name it by description, serial, MAC, then its port name.
    const name = onu.description || onu.serial || onu.mac || onuLabel(onu);

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            loading={isPending}
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
                        type="button"
                        variant="destructive"
                        size="default"
                        onClick={() => handleReboot(close)}
                        disabled={loading}
                        loading={loading}
                    >
                        {!loading && <RotateCcw className="h-4 w-4" />}
                        {t("onu.reboot.confirm_button")}
                    </MyButton>
                </>
            )}
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <RotateCcw className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <DialogTitle className="text-center">{t("onu.reboot.title")}</DialogTitle>
                    <DialogDescription className="text-center">{t("onu.reboot.confirm", { name })}</DialogDescription>
                    <p className="text-sm text-muted-foreground">{t("onu.reboot.warning")}</p>
                </div>
            </div>
        </MyDialog>
    );
}

"use client";

import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SelectInput } from "@/components/controls/select-input";
import { packageOptionLabel } from "@/components/packages/package-option-label";
import useApiMutation from "@/hooks/use-api-mutation";
import { Package } from "lucide-react";
import { FC, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientRow, getClientId } from "./client-type";

interface ChangePackagePayload {
    package_id: string | number;
}

interface ClientChangePackageDialogProps {
    client: ClientRow;
    trigger?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const ClientChangePackageDialog: FC<ClientChangePackageDialogProps> = ({
    client,
    trigger,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();

    const clientId = getClientId(client) ?? "";

    const currentPackageId = client.package_id ?? null;
    const [packageId, setPackageId] = useState<string | number | null>(currentPackageId);

    const { mutateAsync, isPending } = useApiMutation<unknown, ChangePackagePayload>({
        url: `/clients-change-package/${clientId}`,
        method: "PUT",
        invalidateKeys: "clients",
        successMessage: "client.change_package.success",
    });

    const handleSubmit = async (close: () => void) => {
        if (!packageId) return;
        await mutateAsync({ package_id: packageId });
        close();
    };

    const handleOpenChange = (value: boolean) => {
        if (!value) setPackageId(currentPackageId);
        onOpenChange?.(value);
    };

    return (
        <MyDialog
            trigger={trigger}
            open={open}
            onOpenChange={handleOpenChange}
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
                        action="save"
                        variant="default"
                        size="default"
                        onClick={() => handleSubmit(close)}
                        disabled={loading || !packageId}
                        loading={loading}
                        title={t("common.confirm")}
                    />
                </>
            )}
        >
            <div className="space-y-4 pb-1">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-center">
                            {t("client.change_package.title")}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            {t("client.change_package.confirm")}
                        </DialogDescription>
                    </div>
                </div>

                <div className="border-t pt-3 space-y-1 text-sm text-muted-foreground">
                    <p>
                        <span className="font-medium text-foreground">
                            {t("client.package.label")}:
                        </span>{" "}
                        {client.package?.name ?? "—"}
                    </p>
                    <p>
                        <span className="font-medium text-foreground">
                            {t("client.pppoe_username.label")}:
                        </span>{" "}
                        {client.pppoe_username ?? "—"}
                    </p>
                    <p>
                        <span className="font-medium text-foreground">
                            {t("client.phone.label")}:
                        </span>{" "}
                        {client.phone ?? "—"}
                    </p>
                </div>

                <SelectInput
                    id="package_id"
                    value={packageId}
                    onChange={(value) => setPackageId(Array.isArray(value) ? null : value)}
                    label={{ labelText: t("client.package.label") }}
                    api="/dropdown-network-packages"
                    formatLabel={packageOptionLabel}
                    placeholder="client.package.placeholder"
                />
            </div>
        </MyDialog>
    );
};

export default ClientChangePackageDialog;

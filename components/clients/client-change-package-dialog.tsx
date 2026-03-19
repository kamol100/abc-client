"use client";

import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import SelectDropdown from "@/components/select-dropdown";
import useApiMutation from "@/hooks/use-api-mutation";
import { Package } from "lucide-react";
import { FC, ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ClientRow } from "./client-type";

interface ChangePackageForm {
    package_id: number | null;
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

    const form = useForm<ChangePackageForm>({
        defaultValues: { package_id: client.package_id ?? null },
    });

    const { mutateAsync, isPending } = useApiMutation<unknown, ChangePackageForm>({
        url: `/clients-change-package/${client.id}`,
        method: "PUT",
        invalidateKeys: "clients",
        successMessage: "client.change_package.success",
    });

    const handleSubmit = async (close: () => void) => {
        const data = form.getValues();
        if (!data.package_id) return;
        await mutateAsync(data);
        close();
    };

    const handleOpenChange = (value: boolean) => {
        if (!value) form.reset({ package_id: client.package_id ?? null });
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
                        disabled={loading || !form.watch("package_id")}
                        loading={loading}
                        title={t("common.confirm")}
                    />
                </>
            )}
        >
            <div className="space-y-4">
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

                <FormProvider {...form}>
                    <SelectDropdown
                        name="package_id"
                        label={{ labelText: t("client.package.label") }}
                        api="/dropdown-network-packages"
                        placeholder="client.package.placeholder"
                    />
                </FormProvider>
            </div>
        </MyDialog>
    );
};

export default ClientChangePackageDialog;

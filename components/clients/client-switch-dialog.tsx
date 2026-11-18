"use client";

import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import SelectDropdown from "@/components/select-dropdown";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ClientRow, getClientId } from "@/components/clients/client-type";
import useApiMutation from "@/hooks/use-api-mutation";
import { ArrowRightLeft } from "lucide-react";
import { FC } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface SwitchResellerForm {
    reseller_id: number | string | null;
}

interface ClientSwitchDialogProps {
    client: ClientRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function selectedResellerId(value: unknown): number | null {
    if (typeof value === "number" && Number.isInteger(value) && value > 0) {
        return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        if (Number.isInteger(parsed) && parsed > 0) return parsed;
    }
    return null;
}

const ClientSwitchDialog: FC<ClientSwitchDialogProps> = ({
    client,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const clientId = getClientId(client) ?? "";

    const form = useForm<SwitchResellerForm>({
        defaultValues: { reseller_id: null },
    });

    const { mutateAsync, isPending } = useApiMutation<unknown, { reseller_id: number }>({
        url: `/clients/${clientId}/switch-reseller`,
        method: "POST",
        invalidateKeys: "clients,reseller-clients",
        successMessage: "client.switch_reseller.success",
        defaultErrorMessage: "client.switch_reseller.failed",
    });

    const resellerId = selectedResellerId(form.watch("reseller_id"));

    const handleSubmit = async (close: () => void) => {
        if (resellerId === null) return;
        await mutateAsync({ reseller_id: resellerId });
        close();
    };

    const handleOpenChange = (value: boolean) => {
        if (!value) form.reset({ reseller_id: null });
        onOpenChange(value);
    };

    return (
        <MyDialog
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
                        title="common.cancel"
                    />
                    <MyButton
                        action="move"
                        variant="default"
                        size="default"
                        icon
                        onClick={() => handleSubmit(close)}
                        disabled={loading || resellerId === null}
                        loading={loading}
                        title="client.switch_reseller.submit"
                    />
                </>
            )}
        >
            <div className="space-y-4">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <ArrowRightLeft className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-center">
                            {t("client.switch_reseller.title")}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            {t("client.switch_reseller.description")}
                        </DialogDescription>
                    </div>
                </div>

                <div className="border-t pt-3 space-y-1 text-sm text-muted-foreground">
                    <p>
                        <span className="font-medium text-foreground">
                            {t("client.name.label")}:
                        </span>{" "}
                        {client.name}
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
                <div className="my-2">
                    <FormProvider {...form}>
                        <div className="mb-1">
                            <SelectDropdown
                                name="reseller_id"
                                label={{ labelText: t("client.switch_reseller.reseller.label") }}
                                api="/dropdown-resellers/company"
                                placeholder="client.switch_reseller.reseller.placeholder"
                                isClearable
                            />
                        </div>
                    </FormProvider>
                </div>
            </div>
        </MyDialog>
    );
};

export default ClientSwitchDialog;

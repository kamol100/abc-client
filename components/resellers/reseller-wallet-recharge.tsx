"use client";

import { FC, useMemo } from "react";
import { FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { MyDialog } from "@/components/my-dialog";
import { formatMoney } from "@/lib/helper/helper";
import ResellerWalletFormFieldSchema from "@/components/resellers/reseller-wallet-form-schema";
import {
    ResellerRow,
    ResellerWalletRechargeFormInput,
    ResellerWalletRechargeFormSchema,
} from "@/components/resellers/reseller-type";

type ResellerWalletRechargeDialogProps = {
    reseller: Pick<ResellerRow, "name" | "wallet">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ResellerWalletRechargeDialog: FC<ResellerWalletRechargeDialogProps> = ({
    reseller,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const formSchema = useMemo(() => ResellerWalletFormFieldSchema(), []);
    const walletId = reseller.wallet?.id;

    const defaultValues = useMemo<ResellerWalletRechargeFormInput>(
        () => ({
            recharge_method: "cash",
            balance: 0,
            note: "",
        }),
        []
    );

    if (!walletId) {
        return null;
    }

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            size="md"
            title="reseller.wallet_recharge.title"
        >
            <div className="space-y-4">
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    <p className="font-medium">{reseller.name}</p>
                    <p className="text-muted-foreground">
                        {t("reseller.wallet_recharge.current_balance")}: ৳
                        {formatMoney(reseller.wallet?.balance ?? 0)}
                    </p>
                </div>

                <FormBuilder
                    key={open ? "open" : "closed"}
                    formSchema={formSchema}
                    grids={1}
                    api="reseller-wallet-recharge"
                    method="POST"
                    mode="create"
                    queryKey="resellers"
                    successMessage="reseller.wallet_recharge.messages.recharge_successful"
                    schema={ResellerWalletRechargeFormSchema}
                    data={defaultValues}
                    onClose={() => onOpenChange(false)}
                    transformPayload={(values: FieldValues): FieldValues => {
                        const payload = values as ResellerWalletRechargeFormInput;
                        return {
                            ...payload,
                            walletUuid: walletId,
                        };
                    }}
                />
            </div>
        </MyDialog>
    );
};

export default ResellerWalletRechargeDialog;

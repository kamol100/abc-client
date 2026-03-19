"use client";

import { FC, useMemo, useState } from "react";
import { FieldValues } from "react-hook-form";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { MyDialog } from "@/components/my-dialog";
import { formatMoney } from "@/lib/helper/helper";
import { CompanyRow } from "@/components/companies/company-type";
import CompanyWalletFormFieldSchema from "./company-wallet-form-schema";
import {
  CompanyWalletFormInput,
  CompanyWalletFormSchema,
} from "./company-wallet-type";

type CompanyWalletFormProps = {
  company: Pick<CompanyRow, "id" | "name" | "wallet">;
};

const CompanyWalletForm: FC<CompanyWalletFormProps> = ({ company }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const formSchema = useMemo(() => CompanyWalletFormFieldSchema(), []);
  const defaultValues = useMemo<CompanyWalletFormInput>(
    () => ({
      recharge_method: "cash",
      balance: 0,
    }),
    []
  );

  const walletId = company.wallet?.id;

  if (!walletId) {
    return null;
  }

  return (
    <MyDialog
      open={open}
      onOpenChange={setOpen}
      size="md"
      title="company_wallet.recharge_title"
      trigger={
        <MyButton
          type="button"
          variant="outline"
          aria-label={t("company_wallet.recharge_action")}
        >
          <Wallet />
        </MyButton>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <p className="font-medium">{company.name}</p>
          <p className="text-muted-foreground">
            {t("company_wallet.current_balance")}: ৳
            {formatMoney(company.wallet?.balance ?? 0)}
          </p>
        </div>

        <FormBuilder
          formSchema={formSchema}
          grids={1}
          api={`wallets/${walletId}`}
          method="PUT"
          mode="create"
          queryKey="companies"
          successMessage="company_wallet.messages.recharge_successful"
          schema={CompanyWalletFormSchema}
          data={defaultValues}
          transformPayload={(values: FieldValues): FieldValues => {
            const payload = values as CompanyWalletFormInput;
            return {
              ...payload,
              amount: payload.balance,
              company_id: company.id,
            };
          }}
        />
      </div>
    </MyDialog>
  );
};

export default CompanyWalletForm;

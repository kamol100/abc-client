"use client";

import { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWatch } from "react-hook-form";
import { formatMoney } from "@/lib/helper/helper";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import FundTransactionFormFieldSchema from "./fund-transaction-form-schema";
import { FundTransactionFormSchema } from "./fund-transaction-type";

type FundTransactionFormProps = {
  fundId: number;
  fundName?: string | null;
  fundBalance?: number | string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

const FundTransactionFormFields = ({
  renderField,
  fields,
}: {
  renderField: (field: FormFieldConfig) => ReactNode;
  fields: FormFieldConfig[];
}) => {
  const transactionType = useWatch({ name: "transaction_type" });
  const fieldMap = useMemo(
    () =>
      fields.reduce<Record<string, FormFieldConfig>>((acc, field) => {
        acc[field.name] = field;
        return acc;
      }, {}),
    [fields]
  );

  return (
    <div className="grid gap-4">
      {fieldMap.transaction_type && renderField(fieldMap.transaction_type)}
      {fieldMap.amount && renderField(fieldMap.amount)}
      {transactionType === "transfer" &&
        fieldMap.transfer_by &&
        renderField(fieldMap.transfer_by)}
      {fieldMap.note && renderField(fieldMap.note)}
    </div>
  );
};

const FundTransactionForm = ({
  fundId,
  fundName,
  fundBalance = 0,
  open,
  onOpenChange,
  trigger,
}: FundTransactionFormProps) => {
  const { t } = useTranslation();
  const formSchema = FundTransactionFormFieldSchema();

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      size="lg"
      title="fund_transaction.create_title"
    >
      <div className="space-y-4">
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <p className="font-medium">{fundName ?? "—"}</p>
          <p className="text-muted-foreground">
            {t("fund_transaction.current_balance")}: ৳{formatMoney(fundBalance)}
          </p>
        </div>

        <FormBuilder
          formSchema={formSchema}
          grids={1}
          api={`/fund-transactions/${fundId}`}
          mode="create"
          schema={FundTransactionFormSchema}
          method="POST"
          queryKey="funds,fund-transactions"
          data={{
            amount: 0,
            note: "",
            transfer_by: null,
            transaction_type: "deposit",
          }}
        >
          {(renderField) => (
            <FundTransactionFormFields
              renderField={renderField}
              fields={formSchema}
            />
          )}
        </FormBuilder>
      </div>
    </DialogWrapper>
  );
};

export default FundTransactionForm;

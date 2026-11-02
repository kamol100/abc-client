"use client";

import { ReactNode, useEffect } from "react";
import { FieldValues, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import SelectDropdown from "@/components/select-dropdown";
import FormTrigger from "@/components/form-trigger";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { fundTransactionAccess } from "@/components/fund-transactions/fund-transaction-access";
import FundTransactionFormFieldSchema from "@/components/fund-transactions/fund-transaction-form-schema";
import { FundTransactionFormSchema } from "@/components/fund-transactions/fund-transaction-type";
import { MyDialog } from "@/components/my-dialog";
import { Form } from "@/components/ui/form";
import { useProfile, useSetting } from "@/context/app-provider";
import { formatMoney } from "@/lib/helper/helper";

type FundPickValues = {
  fund_uuid: string | null;
  fund_name: string;
  fund_balance: number | string | null;
};

type FundTransactionFormProps = {
  fundId?: string | number | null;
  fundName?: string | null;
  fundBalance?: number | string | null;
  queryKey?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

const FundTransactionEditor = ({
  fundId,
  queryKey,
  actionButton,
}: {
  fundId: string | null;
  queryKey: string;
  actionButton: boolean;
}) => (
  <FormBuilder
    formSchema={FundTransactionFormFieldSchema(fundId)}
    grids={1}
    api={fundId ? `/fund-transactions/${fundId}` : ""}
    mode="create"
    schema={FundTransactionFormSchema}
    method="POST"
    queryKey={queryKey}
    actionButton={actionButton}
    data={{
      amount: 0,
      note: "",
      transfer_by: null,
      transaction_type: "transfer",
    }}
    transformPayload={(values: FieldValues) => ({
      ...values,
      transaction_type: "transfer",
    })}
  />
);

const FundTransactionBody = ({
  queryKey,
  presetFund,
}: {
  queryKey: string;
  presetFund: FundPickValues | null;
}) => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const roles = useSetting("roles");
  const access = fundTransactionAccess({
    roles,
    staff: profile.staff,
    presetFund: presetFund
      ? {
        uuid: presetFund.fund_uuid,
        name: presetFund.fund_name,
        balance: presetFund.fund_balance,
      }
      : null,
  });

  const picker = useForm<FundPickValues>({
    defaultValues: {
      fund_uuid: access.fundUuid,
      fund_name: access.fundName,
      fund_balance: access.fundBalance,
    },
  });
  const { clearErrors, control, getValues, setError, setValue } = picker;
  const fundUuid = useWatch({ control, name: "fund_uuid" });
  const fundBalance = useWatch({ control, name: "fund_balance" });

  useEffect(() => {
    if (access.lockFund) {
      setValue("fund_uuid", access.fundUuid);
      setValue("fund_name", access.fundName);
      setValue("fund_balance", access.fundBalance);
      return;
    }

    if (access.fundUuid && !getValues("fund_uuid")) {
      setValue("fund_uuid", access.fundUuid);
      setValue("fund_name", access.fundName);
      setValue("fund_balance", access.fundBalance);
    }
  }, [
    access.fundBalance,
    access.fundName,
    access.fundUuid,
    access.lockFund,
    getValues,
    setValue,
  ]);

  const selectedFundUuid = typeof fundUuid === "string" && fundUuid !== "" ? fundUuid : null;

  useEffect(() => {
    if (selectedFundUuid) clearErrors("fund_uuid");
  }, [clearErrors, selectedFundUuid]);

  return (
    <div
      className="grid gap-4"
      onSubmitCapture={() => {
        if (selectedFundUuid || access.blockSubmit) return;
        setError("fund_uuid", {
          type: "required",
          message: "fund_transaction.fund.errors.required",
        });
      }}
    >
      <Form {...picker}>
        <SelectDropdown
          name="fund_uuid"
          label={{
            labelText: "fund_transaction.fund.label",
            mandatory: true,
          }}
          placeholder="fund_transaction.fund.placeholder"
          api={access.lockFund ? undefined : "/dropdown-funds"}
          options={access.lockFund ? (access.fundOption ? [access.fundOption] : []) : undefined}
          optionValueKey={access.lockFund ? undefined : "uuid"}
          isDisabled={access.lockFund}
          isClearable={false}
          populate={
            access.lockFund
              ? undefined
              : [
                { field: "fund_name", from: "name" },
                { field: "fund_balance", from: "balance" },
              ]
          }
        />
      </Form>

      {access.showUnassignedWarning ? (
        <p role="alert" className="text-sm text-destructive">
          {t("fund_transaction.fund.errors.unassigned")}
        </p>
      ) : null}

      {selectedFundUuid ? (
        <p className="text-sm text-muted-foreground">
          {t("fund_transaction.current_balance")}: ৳{formatMoney(fundBalance)}
        </p>
      ) : null}

      <FundTransactionEditor
        fundId={access.blockSubmit ? null : selectedFundUuid}
        queryKey={queryKey}
        actionButton={!access.blockSubmit}
      />
    </div>
  );
};

const FundTransactionForm = ({
  fundId,
  fundName,
  fundBalance = 0,
  queryKey = "funds,fund-transactions",
  open,
  onOpenChange,
  trigger,
}: FundTransactionFormProps) => {
  const presetFund =
    fundId != null && fundId !== ""
      ? {
        fund_uuid: String(fundId),
        fund_name: fundName ?? "",
        fund_balance: fundBalance,
      }
      : null;

  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger ?? <FormTrigger mode="create" />}
      size="lg"
      title="fund_transaction.create_title"
    >
      <FundTransactionBody queryKey={queryKey} presetFund={presetFund} />
    </MyDialog>
  );
};

export default FundTransactionForm;

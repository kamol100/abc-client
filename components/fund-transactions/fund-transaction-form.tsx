"use client";

/**
 * Add Fund Transaction dialog: moves money from a sender fund to a receiver fund.
 *
 * The form is split in two on purpose:
 * - The receiver fund lives in its own small form (`useReceiverFund`), because its
 *   uuid is part of the API path: `POST /fund-transactions/{receiverUuid}`.
 * - Sender, amount and note live in `FormBuilder` (`TransferForm`) and are the payload.
 *
 * The receiver field is passed into `TransferForm` as a slot so it renders between
 * the sender and the amount.
 *
 * When the sender is the bKash fund, an optional Transaction By (staff) field appears.
 * If a staff member is picked, the amount may not exceed their bKash total.
 */

import { ReactNode, useEffect, useMemo } from "react";
import { FieldValues, useForm, useFormContext, useWatch, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import SelectDropdown from "@/components/select-dropdown";
import FormTrigger from "@/components/form-trigger";
import FormBuilder from "@/components/form-wrapper/form-builder";
import {
  fundTransactionAccess,
  type FundTransactionAccess,
} from "@/components/fund-transactions/fund-transaction-access";
import FundTransactionFormFieldSchema from "@/components/fund-transactions/fund-transaction-form-schema";
import { FundTransactionFormSchema } from "@/components/fund-transactions/fund-transaction-type";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { MyDialog } from "@/components/my-dialog";
import { Form } from "@/components/ui/form";
import { useProfile, useSetting } from "@/context/app-provider";
import { formatMoney } from "@/lib/helper/helper";

type FundTransactionFormProps = {
  /** Receiver fund uuid to preset (the fund's own transactions dialog). */
  fundId?: string | number | null;
  fundName?: string | null;
  fundBalance?: number | string | null;
  queryKey?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

type ReceiverFundValues = {
  fund_uuid: string | null;
  fund_name: string;
  fund_balance: number | string | null;
};

const TRANSFER_DEFAULTS = {
  amount: 0,
  note: "",
  transfer_by: null,
  transaction_by: null,
  transaction_by_amount: null,
  transaction_type: "transfer",
};

/** This dialog only records transfers. The staff's bKash total is only for the form check. */
const asTransfer = (values: FieldValues): FieldValues => {
  const payload: FieldValues = { ...values, transaction_type: "transfer" };
  delete payload.transaction_by_amount;
  return payload;
};

const QUIET = { shouldDirty: false, shouldValidate: false } as const;

const hasSelection = (value: unknown): boolean => value != null && value !== "";

const selectedUuid = (value: unknown): string | null =>
  typeof value === "string" && value !== "" ? value : null;

// --- Shared ---

/** "Current Balance: ৳1,220" under a field, or "unavailable" when unknown. */
const FundBalanceHint = ({
  balance,
  label = "fund_transaction.current_balance",
}: {
  balance: unknown;
  /** Translation key shown before the amount. */
  label?: string;
}) => {
  const { t } = useTranslation();
  const known = typeof balance === "number" || (typeof balance === "string" && balance !== "");

  return (
    <p className="text-sm text-muted-foreground">
      {t(label)}:{" "}
      {known ? `৳${formatMoney(balance)}` : t("fund_transaction.balance_unavailable")}
    </p>
  );
};

// --- Sender fund (inside FormBuilder) ---

const clearSenderDetails = (setValue: UseFormReturn["setValue"]) => {
  setValue("sender_name", null, QUIET);
  setValue("sender_balance", null, QUIET);
  setValue("sender_uuid", null, QUIET);
};

/**
 * Clears the sender's populated details when it is cleared, and rejects a sender
 * that is the same fund as the receiver.
 */
function useSenderFundGuard(receiverUuid: string | null) {
  const { setError, setValue } = useFormContext();
  const transferBy = useWatch({ name: "transfer_by" });
  const senderUuid = useWatch({ name: "sender_uuid" });

  useEffect(() => {
    if (!hasSelection(transferBy)) {
      clearSenderDetails(setValue);
      return;
    }

    if (!receiverUuid || senderUuid !== receiverUuid) return;

    setValue("transfer_by", null, { shouldDirty: true, shouldValidate: true });
    clearSenderDetails(setValue);
    setError("transfer_by", {
      type: "validate",
      message: "fund_transaction.transfer_by.errors.same",
    });
  }, [receiverUuid, senderUuid, setError, setValue, transferBy]);

  return hasSelection(transferBy);
}

const SenderFundBalance = ({ receiverUuid }: { receiverUuid: string | null }) => {
  const hasSender = useSenderFundGuard(receiverUuid);
  const senderBalance = useWatch({ name: "sender_balance" });

  return hasSender ? <FundBalanceHint balance={senderBalance} /> : null;
};

// --- Transaction By (bKash sender only, inside FormBuilder) ---

const isBkashFund = (name: unknown): boolean =>
  typeof name === "string" && name.trim().toLowerCase() === "bkash";

/**
 * Shows Transaction By only while the sender is the bKash fund, clears it when hidden,
 * and re-checks the amount when the staff (and so the limit) changes.
 */
function useBkashTransactionBy() {
  const { setValue, trigger } = useFormContext();
  const transferBy = useWatch({ name: "transfer_by" });
  const senderName = useWatch({ name: "sender_name" });
  const transactionBy = useWatch({ name: "transaction_by" });
  const limit = useWatch({ name: "transaction_by_amount" });
  const amount = useWatch({ name: "amount" });

  const visible = hasSelection(transferBy) && isBkashFund(senderName);
  const selected = visible && hasSelection(transactionBy);

  useEffect(() => {
    if (!visible && hasSelection(transactionBy)) setValue("transaction_by", null, QUIET);
    if (!selected && limit != null) setValue("transaction_by_amount", null, QUIET);
  }, [limit, selected, setValue, transactionBy, visible]);

  useEffect(() => {
    if (Number(amount) > 0) void trigger("amount");
    // Only when the limit changes; typing in Amount validates itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, limit, trigger]);

  return { visible, selected, limit };
}

const BkashTransactionBy = ({ field }: { field: ReactNode }) => {
  const { visible, selected, limit } = useBkashTransactionBy();
  if (!visible) return null;

  return (
    <div className="grid gap-1">
      {field}
      {selected ? <FundBalanceHint label="fund_transaction.transaction_by.total" balance={limit} /> : null}
    </div>
  );
};

// --- Transfer form: sender, Transaction By, receiver slot, amount, note ---

const TransferForm = ({
  receiverUuid,
  queryKey,
  canSubmit,
  receiverField,
}: {
  /** Null until a receiver is chosen; the form cannot post without it. */
  receiverUuid: string | null;
  queryKey: string;
  canSubmit: boolean;
  receiverField: ReactNode;
}) => {
  const formSchema = useMemo(() => FundTransactionFormFieldSchema(receiverUuid), [receiverUuid]);
  const fieldNamed = (name: string): FieldConfig | undefined =>
    formSchema.find((field) => field.name === name);

  return (
    <FormBuilder
      formSchema={formSchema}
      grids={1}
      api={receiverUuid ? `/fund-transactions/${receiverUuid}` : ""}
      mode="create"
      schema={FundTransactionFormSchema}
      method="POST"
      queryKey={queryKey}
      actionButton={canSubmit}
      data={TRANSFER_DEFAULTS}
      transformPayload={asTransfer}
    >
      {(renderField) => {
        const render = (name: string) => {
          const field = fieldNamed(name);
          return field ? renderField(field) : null;
        };

        return (
          <div className="grid gap-4">
            <div className="grid gap-1">
              {render("transfer_by")}
              <SenderFundBalance receiverUuid={receiverUuid} />
            </div>
            <BkashTransactionBy field={render("transaction_by")} />
            {receiverField}
            {render("amount")}
            {render("note")}
          </div>
        );
      }}
    </FormBuilder>
  );
};

// --- Receiver fund (its own form) ---

/**
 * Receiver fund state. Starts on the preset fund (or the user's own fund when they
 * cannot choose) and stays there when the fund is locked.
 */
function useReceiverFund(access: FundTransactionAccess) {
  const picker = useForm<ReceiverFundValues>({
    defaultValues: {
      fund_uuid: access.fundUuid,
      fund_name: access.fundName,
      fund_balance: access.fundBalance,
    },
  });
  const { clearErrors, control, getValues, setError, setValue } = picker;
  const receiverUuid = selectedUuid(useWatch({ control, name: "fund_uuid" }));
  const receiverBalance = useWatch({ control, name: "fund_balance" });

  useEffect(() => {
    const keepAccessFund = access.lockFund || (access.fundUuid && !getValues("fund_uuid"));
    if (!keepAccessFund) return;

    setValue("fund_uuid", access.fundUuid);
    setValue("fund_name", access.fundName);
    setValue("fund_balance", access.fundBalance);
  }, [access.fundBalance, access.fundName, access.fundUuid, access.lockFund, getValues, setValue]);

  useEffect(() => {
    if (receiverUuid) clearErrors("fund_uuid");
  }, [clearErrors, receiverUuid]);

  /** The receiver is not in the transfer schema, so flag it when the transfer form submits. */
  const flagMissingReceiver = () => {
    if (receiverUuid || access.blockSubmit) return;
    setError("fund_uuid", {
      type: "required",
      message: "fund_transaction.received_by.errors.required",
    });
  };

  return { picker, receiverUuid, receiverBalance, flagMissingReceiver };
}

const ReceiverFundField = ({
  picker,
  access,
  receiverUuid,
  receiverBalance,
}: {
  picker: UseFormReturn<ReceiverFundValues>;
  access: FundTransactionAccess;
  receiverUuid: string | null;
  receiverBalance: unknown;
}) => {
  const { t } = useTranslation();
  const locked = access.lockFund;

  return (
    <div className="grid gap-1">
      <Form {...picker}>
        <SelectDropdown
          name="fund_uuid"
          label={{
            labelText: "fund_transaction.received_by.label",
            mandatory: true,
          }}
          placeholder="fund_transaction.received_by.placeholder"
          api={locked ? undefined : "/dropdown-funds"}
          options={locked ? (access.fundOption ? [access.fundOption] : []) : undefined}
          optionValueKey={locked ? undefined : "uuid"}
          isDisabled={locked}
          isClearable={false}
          populate={
            locked
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

      {receiverUuid ? <FundBalanceHint balance={receiverBalance} /> : null}
    </div>
  );
};

// --- Dialog body ---

const FundTransactionBody = ({
  queryKey,
  presetFund,
}: {
  queryKey: string;
  presetFund: ReceiverFundValues | null;
}) => {
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
  const { picker, receiverUuid, receiverBalance, flagMissingReceiver } = useReceiverFund(access);

  return (
    <div className="grid gap-4" onSubmitCapture={flagMissingReceiver}>
      <TransferForm
        receiverUuid={access.blockSubmit ? null : receiverUuid}
        queryKey={queryKey}
        canSubmit={!access.blockSubmit}
        receiverField={
          <ReceiverFundField
            picker={picker}
            access={access}
            receiverUuid={receiverUuid}
            receiverBalance={receiverBalance}
          />
        }
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
  const presetFund = hasSelection(fundId)
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

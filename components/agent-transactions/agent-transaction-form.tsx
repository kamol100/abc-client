"use client";

import { ReactNode, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import AgentTransactionFormFieldSchema from "@/components/agent-transactions/agent-transaction-form-schema";
import { createAgentTransactionFormSchema } from "@/components/agent-transactions/agent-transaction-type";

type AgentTransactionFormProps = {
  agentId: string;
  agentName?: string | null;
  agentBalance?: number | string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

const AgentTransactionForm = ({
  agentId,
  agentName,
  agentBalance = 0,
  open,
  onOpenChange,
  trigger,
}: AgentTransactionFormProps) => {
  const { t } = useTranslation();
  const formSchema = AgentTransactionFormFieldSchema();
  const availableBalance = toNumber(agentBalance);
  const balanceRef = useRef(availableBalance);
  balanceRef.current = availableBalance;

  const schema = useMemo(
    () => createAgentTransactionFormSchema(() => balanceRef.current),
    []
  );

  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      size="lg"
      title="agent_transaction.create_title"
    >
      <div className="space-y-4">
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <p className="font-medium">{agentName ?? "—"}</p>
          <p className="text-muted-foreground">
            {t("agent_transaction.current_balance")}: ৳{formatMoney(availableBalance)}
          </p>
        </div>

        <FormBuilder
          formSchema={formSchema}
          grids={1}
          api={`/agent-transactions/${agentId}`}
          mode="create"
          schema={schema}
          method="POST"
          queryKey={`agents,agent-transactions-${agentId},agent-transactions`}
          successMessage="agent_transaction.messages.created"
          data={{
            amount: 0,
            description: "",
            transaction_type: "commission",
          }}
        />
      </div>
    </MyDialog>
  );
};

export default AgentTransactionForm;

"use client";

import { useId, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";

/** What the API does with the expense of a deleted "expense" fund transaction. */
export type ExpenseDeleteAction = "pending" | "delete";

const DEFAULT_ACTION: ExpenseDeleteAction = "pending";
const ACTIONS: ExpenseDeleteAction[] = ["pending", "delete"];

/** The fund list and balance, and the expense that changes with the transaction. */
const QUERY_KEYS = "fund-transactions,funds,expenses";

interface ExpenseTransactionDeleteModalProps {
  api_url: string;
}

/**
 * Delete confirmation for a fund transaction written for an expense. The user
 * picks what happens to the expense: back to pending (default) or deleted too.
 */
export function ExpenseTransactionDeleteModal({ api_url }: ExpenseTransactionDeleteModalProps) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const groupId = useId();
  const [action, setAction] = useState<ExpenseDeleteAction>(DEFAULT_ACTION);
  const canDeleteExpense = hasPermission("expenses.delete");

  const { mutateAsync: deleteItem, isPending } = useApiMutation<
    unknown,
    { expense_action: ExpenseDeleteAction }
  >({
    url: api_url,
    method: "DELETE",
    invalidateKeys: QUERY_KEYS,
    successMessage: "common.item_deleted_successfully",
    defaultErrorMessage: "common.delete_failed",
  });

  const handleDelete = async (close: () => void) => {
    await deleteItem({ expense_action: action });
    close();
  };

  return (
    <MyDialog
      trigger={<MyButton action="delete" icon={true} />}
      size="md"
      loading={isPending}
      onOpenChange={(open) => {
        if (!open) setAction(DEFAULT_ACTION);
      }}
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
            action="delete"
            variant="default"
            size="default"
            onClick={() => handleDelete(close)}
            disabled={loading}
            loading={loading}
            title={t("common.delete")}
          />
        </>
      )}
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-7 w-7 text-destructive" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-center">{t("common.confirm_delete")}</DialogTitle>
            <DialogDescription className="text-center">
              {t("fund_transaction.expense_delete.description")}
            </DialogDescription>
          </div>
        </div>

        <RadioGroup
          value={action}
          onValueChange={(value) => setAction(value === "delete" ? "delete" : "pending")}
          aria-label={t("fund_transaction.expense_delete.option_label")}
          disabled={isPending}
          className="gap-0 divide-y rounded-md border text-left"
        >
          {ACTIONS.map((option) => {
            const optionId = `${groupId}-${option}`;
            const blocked = option === "delete" && !canDeleteExpense;

            return (
              <div key={option} className="flex items-start gap-3 px-3 py-2">
                <RadioGroupItem
                  id={optionId}
                  value={option}
                  disabled={blocked}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 text-sm">
                  <Label
                    htmlFor={optionId}
                    className={cn("break-words font-medium", blocked && "text-muted-foreground")}
                  >
                    {t(`fund_transaction.expense_delete.${option}.label`)}
                  </Label>
                  <p className="break-words text-muted-foreground">
                    {t(
                      blocked
                        ? "fund_transaction.expense_delete.delete.no_permission"
                        : `fund_transaction.expense_delete.${option}.hint`,
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </MyDialog>
  );
}

"use client";

import { useId, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CHAIN_DELETE_CONFIRM_WORD,
  chainDeleteDueAgainInvoice,
  chainDeleteEntries,
  isChainDeleteConfirmed,
} from "@/components/wallets/chain-delete";
import type { LinkedPaymentChain } from "@/components/wallets/wallet-type";
import useApiMutation from "@/hooks/use-api-mutation";
import { formatMoney } from "@/lib/helper/helper";

/** Every list the delete changes: the wallet, the fund, the payment and the invoice. */
const CHAIN_QUERY_KEYS =
  "wallet-transactions,client-wallets,clients,payments,invoices,funds,fund-transactions";

interface ChainDeleteModalProps {
  api_url: string;
  linked: LinkedPaymentChain;
}

/**
 * Delete confirmation for a wallet or fund transaction that belongs to a payment.
 * It names every record the delete takes with it, and the user types OK to allow it.
 */
export function ChainDeleteModal({ api_url, linked }: ChainDeleteModalProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const [typed, setTyped] = useState("");
  const confirmed = isChainDeleteConfirmed(typed);
  const entries = chainDeleteEntries(linked);
  const dueAgainInvoice = chainDeleteDueAgainInvoice(linked);
  const amount = formatMoney(linked.amount);

  const { mutateAsync: deleteItem, isPending } = useApiMutation<unknown, undefined>({
    url: api_url,
    method: "DELETE",
    invalidateKeys: CHAIN_QUERY_KEYS,
    successMessage: "common.item_deleted_successfully",
    defaultErrorMessage: "common.delete_failed",
  });

  const handleDelete = async (close: () => void) => {
    if (!confirmed) return;
    await deleteItem(undefined);
    close();
  };

  return (
    <MyDialog
      trigger={<MyButton action="delete" icon={true} />}
      size="md"
      loading={isPending}
      onOpenChange={(open) => {
        if (!open) setTyped("");
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
            disabled={loading || !confirmed}
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
              {t("wallet.chain_delete.description")}
            </DialogDescription>
          </div>
        </div>

        <ul className="divide-y rounded-md border text-left">
          {entries.map((entry) => (
            <li key={entry.key} className="flex items-start gap-3 px-3 py-2">
              {/* Always ticked: the records go together, none can be left out. */}
              <Checkbox
                checked
                aria-readonly
                tabIndex={-1}
                aria-label={t(entry.label, entry.values)}
                className="pointer-events-none mt-0.5"
              />
              <div className="min-w-0 text-sm">
                <p className="font-medium break-words">{t(entry.label, entry.values)}</p>
                {entry.effect && (
                  <p className="text-muted-foreground break-words">
                    {t(entry.effect, { ...entry.values, amount })}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {dueAgainInvoice && (
          <p className="text-sm text-muted-foreground">
            {t("wallet.chain_delete.invoice_due_again", { id: dueAgainInvoice })}
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-left">
          <Label htmlFor={inputId}>
            {t("wallet.chain_delete.confirm_label", { word: CHAIN_DELETE_CONFIRM_WORD })}
          </Label>
          <Input
            id={inputId}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={CHAIN_DELETE_CONFIRM_WORD}
            autoComplete="off"
            disabled={isPending}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
          />
        </div>
      </div>
    </MyDialog>
  );
}

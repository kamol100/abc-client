import type { LinkedPaymentChain } from "@/components/wallets/wallet-type";

/** One record the API deletes together with the transaction. */
export interface ChainDeleteEntry {
  key: "invoice" | "payment" | "fund_transaction" | "wallet_transaction";
  /** Translation key of the record's name. */
  label: string;
  /** Translation key of what happens to a balance, when one changes. */
  effect?: string;
  values: { id: string; fund: string };
}

const WALLET_RECHARGE = "wallet_recharge";

/**
 * The records that go when a transaction of this payment is deleted.
 * An advance payment loses all four. The advance taken for a bill loses only its
 * wallet deduction (and the payment, for a bill paid the older way); the bill stays.
 */
export function chainDeleteEntries(linked: LinkedPaymentChain): ChainDeleteEntry[] {
  const isRecharge = linked.source === WALLET_RECHARGE;
  const fund = linked.fund ?? "";
  const entries: ChainDeleteEntry[] = [];

  if (linked.invoice_deleted && linked.invoice) {
    entries.push({
      key: "invoice",
      label: "wallet.chain_delete.entries.invoice",
      values: { id: linked.invoice, fund },
    });
  }

  // The advance taken for a bill has no payment: only the wallet deduction goes.
  if (linked.payment) {
    entries.push({
      key: "payment",
      label: "wallet.chain_delete.entries.payment",
      values: { id: linked.payment, fund },
    });
  }

  if (isRecharge && fund !== "") {
    entries.push({
      key: "fund_transaction",
      label: "wallet.chain_delete.entries.fund_transaction",
      effect: "wallet.chain_delete.effects.fund_decrease",
      values: { id: "", fund },
    });
  }

  entries.push({
    key: "wallet_transaction",
    label: "wallet.chain_delete.entries.wallet_transaction",
    effect: isRecharge
      ? "wallet.chain_delete.effects.wallet_decrease"
      : "wallet.chain_delete.effects.wallet_increase",
    values: { id: "", fund },
  });

  return entries;
}

/** The bill that stays and becomes due again, or null when the invoice is deleted too. */
export function chainDeleteDueAgainInvoice(linked: LinkedPaymentChain): string | null {
  return linked.invoice_deleted ? null : (linked.invoice ?? null);
}

/** The word the user types to allow the delete. */
export const CHAIN_DELETE_CONFIRM_WORD = "OK";

export function isChainDeleteConfirmed(typed: string): boolean {
  return typed.trim().toUpperCase() === CHAIN_DELETE_CONFIRM_WORD;
}

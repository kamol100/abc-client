"use client";

import { FC } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Banknote, Receipt, type LucideIcon } from "lucide-react";
import SummaryChip from "@/components/summary-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { toNumber } from "@/lib/helper/helper";
import {
  FundTransactionTypeValues,
  type FundTransactionType,
  type FundTransactionTypeTotals,
} from "@/components/fund-transactions/fund-transaction-type";

type Props = {
  totals?: FundTransactionTypeTotals | null;
  isLoading?: boolean;
};

const TYPE_ICONS: Record<FundTransactionType, LucideIcon> = {
  deposit: ArrowDownLeft,
  transfer: ArrowLeftRight,
  withdraw: ArrowUpRight,
  expense: Receipt,
  salary: Banknote,
};

/** Types with a total above zero, in the filter's order. */
export function positiveTypeTotals(totals?: FundTransactionTypeTotals | null) {
  return FundTransactionTypeValues
    .map((type) => ({ type, amount: toNumber(totals?.[type]) }))
    .filter(({ amount }) => amount > 0);
}

/**
 * One chip per transaction type, for the table toolbar's center.
 * A type shows only when its total is above zero. Phones: two side by side.
 */
const FundTransactionReports: FC<Props> = ({ totals, isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="h-9 w-40 rounded-[var(--radius)]" />;
  }

  const items = positiveTypeTotals(totals);
  if (items.length === 0) return null;

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-center">
      {items.map(({ type, amount }) => (
        <SummaryChip
          key={type}
          icon={TYPE_ICONS[type]}
          label={`fund_transaction.transaction_type.options.${type}`}
          amount={amount}
          currency="BDT"
          stack
        />
      ))}
    </div>
  );
};

export default FundTransactionReports;

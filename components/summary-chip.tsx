"use client";

import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SummaryChipProps = {
  icon: LucideIcon;
  /** Translation key. */
  label: string;
  amount: number;
  isLoading?: boolean;
  /** Passed to DisplayCount, e.g. "BDT". */
  currency?: string;
  className?: string;
};

/**
 * One money total as an h-9 chip, the same style as the navbar wallet balance.
 * The amount box keeps its width while loading, so nothing around it moves.
 */
export default function SummaryChip({ icon: Icon, label, amount, isLoading, currency, className }: SummaryChipProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--radius)] border border-border bg-background px-2.5",
        className,
      )}
    >
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      <span className="text-xs text-muted-foreground">{t(label)}</span>
      <span className="inline-flex min-w-16 items-center justify-end text-sm font-semibold">
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <DisplayCount amount={amount} formatCurrency animate currency={currency} />
        )}
      </span>
    </div>
  );
}

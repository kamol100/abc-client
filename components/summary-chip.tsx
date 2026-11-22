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
  /** Phones: label above the amount, so two chips fit side by side. */
  stack?: boolean;
  className?: string;
};

/**
 * One money total as an h-9 chip, the same style as the navbar wallet balance.
 * The amount box keeps its width while loading, so nothing around it moves.
 */
export default function SummaryChip({ icon: Icon, label, amount, isLoading, currency, stack, className }: SummaryChipProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex shrink-0 rounded-[var(--radius)] border border-border bg-background px-2.5",
        stack
          ? "min-w-0 flex-col gap-0.5 py-1.5 sm:h-9 sm:flex-row sm:items-center sm:gap-2 sm:whitespace-nowrap sm:py-0"
          : "h-9 items-center gap-2 whitespace-nowrap",
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{t(label)}</span>
      </span>
      <span className={cn("inline-flex h-5 min-w-16 items-center text-sm font-semibold", stack ? "sm:justify-end" : "justify-end")}>
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <DisplayCount amount={amount} formatCurrency animate currency={currency} />
        )}
      </span>
    </div>
  );
}

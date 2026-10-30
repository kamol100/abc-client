"use client";

import { Wallet } from "lucide-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import DisplayMoney from "@/components/display-money";
import { MyButton } from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/context/app-provider";
import { useMyWallet } from "@/hooks/use-my-wallet";
import { cn } from "@/lib/utils";

type MyWalletProps = {
  label?: boolean;
  labelKey?: string;
  className?: string;
  amountClassName?: string;
  loadingClassName?: string;
};

const MyWallet: FC<MyWalletProps> = ({
  label = true,
  labelKey = "wallet.balance.label",
  className,
  amountClassName,
  loadingClassName,
}) => {
  const { t } = useTranslation();
  const { balance, isLoading } = useMyWallet();

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {label && (
        <span className="text-sm text-muted-foreground">
          {t(labelKey)}:
        </span>
      )}

      {isLoading ? (
        <Skeleton className={cn("h-6 w-24", loadingClassName)} />
      ) : (
        <DisplayMoney
          amount={balance}
          animate
          formatCurrency
          className={cn("font-semibold text-primary tabular-nums", amountClassName)}
        />
      )}
    </div>
  );
};

export function WalletBalanceButton() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const canViewWallet = hasPermission("wallets.my");
  const { balance, isLoading } = useMyWallet(canViewWallet);

  if (!canViewWallet) {
    return null;
  }

  return (
    <MyButton
      url="/my-wallets"
      variant="outline"
      size="sm"
      tooltip={t("wallet.my_balance")}
      aria-label={t("wallet.my_balance")}
      className="h-9 shrink-0 rounded-[var(--radius)] border-primary/25 bg-primary/10 px-2.5 font-normal text-foreground shadow-none hover:border-primary/40 hover:bg-primary/15 hover:text-foreground"
    >
      <Wallet className="text-primary" aria-hidden />
      <span className="hidden text-xs text-muted-foreground sm:inline">
        {t("wallet.balance.label")}
      </span>
      <span className="inline-flex min-w-16 shrink-0 items-center justify-end">
        {isLoading ? (
          <Skeleton className="h-4 w-16 bg-primary/20" />
        ) : (
          <DisplayMoney
            amount={balance}
            formatCurrency
            className={cn(
              "text-sm font-semibold",
              balance >= 0 && "text-primary",
            )}
          />
        )}
      </span>
    </MyButton>
  );
}

export default MyWallet;

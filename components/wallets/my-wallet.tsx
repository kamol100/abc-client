"use client";

import DisplayMoney from "@/components/display-money";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyWallet } from "@/hooks/use-my-wallet";
import { cn } from "@/lib/utils";
import { FC } from "react";
import { useTranslation } from "react-i18next";

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

export default MyWallet;

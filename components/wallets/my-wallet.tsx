"use client";

import DisplayMoney from "@/components/display-money";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { MyWalletBalance, MyWalletBalanceSchema } from "./wallet-type";

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
  const { data, isLoading } = useApiQuery<ApiResponse<MyWalletBalance>>({
    queryKey: ["my-wallet"],
    url: "my-wallet",
    pagination: false,
  });

  const parsed = MyWalletBalanceSchema.safeParse(data?.data);
  const balance = parsed.success ? parsed.data.balance : 0;

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

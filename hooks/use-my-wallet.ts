"use client";

import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import {
  MyWalletBalance,
  MyWalletBalanceSchema,
} from "@/components/wallets/wallet-type";

export function useMyWallet() {
  const query = useApiQuery<ApiResponse<MyWalletBalance>>({
    queryKey: ["my-wallet"],
    url: "my-wallet",
    pagination: false,
  });

  const parsed = MyWalletBalanceSchema.safeParse(query.data?.data);

  return {
    ...query,
    wallet: parsed.success ? parsed.data : null,
    balance: parsed.success ? parsed.data.balance : 0,
  };
}

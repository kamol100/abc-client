"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import { TransactionsTable } from "@/components/wallets/transactions-table";

interface TransactionModalProps {
  walletId: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export const TransactionModal: FC<TransactionModalProps> = ({
  walletId,
  open,
  onOpenChange,
  title = "wallet.title_plural",
}) => {
  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      size="4xl"
      title={title}
      showFooter={false}
    >
      {open && <TransactionsTable walletId={walletId} />}
    </MyDialog>
  );
};

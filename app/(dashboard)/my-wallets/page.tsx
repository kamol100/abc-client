import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import { MyWalletTable } from "@/components/wallets/wallet-table";

export const metadata: Metadata = {
  title: t("wallet.my_wallet_title"),
};

export default function MyWalletsPage() {
  return <MyWalletTable />;
}

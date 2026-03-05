import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import { ClientWalletTable } from "@/components/wallets/wallet-table";

export const metadata: Metadata = {
  title: t("wallet.client_wallet_title"),
};

export default function ClientWalletsPage() {
  return <ClientWalletTable />;
}

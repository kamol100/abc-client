import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import FundTransactionTable from "@/components/fund-transactions/fund-transaction-table";

export const metadata: Metadata = {
  title: t("fund_transaction.title_plural"),
};

export default function FundTransactionsPage() {
  return <FundTransactionTable />;
}

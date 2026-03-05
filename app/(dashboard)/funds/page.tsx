import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import FundTable from "@/components/funds/fund-table";

export const metadata: Metadata = {
  title: t("fund.title_plural"),
};

export default function FundsPage() {
  return <FundTable />;
}

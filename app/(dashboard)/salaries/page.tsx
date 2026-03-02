import SalaryTable from "@/components/salaries/salary-table";
import { Metadata } from "next";
import { t } from "@/lib/i18n/server";

export default async function Salaries() {
  return <SalaryTable />;
}

export const metadata: Metadata = {
  title: t("salary.title"),
  description: t("salary.title"),
};

import SalaryTable from "@/components/salaries/salary-table";
import { Metadata } from "next";
import i18n from "i18next";
export default async function Salaries() {
  return <SalaryTable />;
}
export const metadata: Metadata = {
  title: i18n.t("salaries"),
  description: i18n.t("salaries_description") || "Salaries",
};

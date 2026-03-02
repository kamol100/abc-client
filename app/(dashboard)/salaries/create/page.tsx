import SalaryForm from "@/components/salaries/salary-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function SalaryCreate() {
  return <SalaryForm />;
}

export const metadata: Metadata = {
  title: t("salary.create.title"),
  description: t("salary.create.title"),
};
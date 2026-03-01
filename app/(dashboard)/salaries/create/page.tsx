import SalaryForm from "@/components/salaries/salary-form";
import i18n from "i18next";
import { Metadata } from "next";

export default async function SalaryCreate() {
  return <SalaryForm />;
}

export const metadata: Metadata = {
  title: i18n.t("create_salary"),
  description: i18n.t("create_salary_description") || "Create Salary",
};
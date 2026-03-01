import SalaryForm from "@/components/salaries/salary-form";
import i18n from "i18next";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SalaryEdit({ params }: Props) {
  const { id } = await params;

  return <SalaryForm mode="edit" data={{ id }} />;
}

export const metadata: Metadata = {
  title: i18n.t("edit_salary"),
  description: i18n.t("edit_salary_description") || "Edit Salary",
};
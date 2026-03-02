import SalaryForm from "@/components/salaries/salary-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SalaryEdit({ params }: Props) {
  const { id } = await params;

  return <SalaryForm mode="edit" data={{ id }} />;
}

export const metadata: Metadata = {
  title: t("salary.edit.title"),
  description: t("salary.edit.title"),
};
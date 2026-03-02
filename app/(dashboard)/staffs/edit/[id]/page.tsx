import StaffForm from "@/components/staffs/staff-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StaffEdit({ params }: Props) {
  const { id } = await params;

  return <StaffForm mode="edit" data={{ id }} />;
}

export const metadata: Metadata = {
  title: t("staff.edit.title"),
  description: t("staff.edit.title"),
};

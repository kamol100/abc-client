import StaffForm from "@/components/staffs/staff-form";
import i18n from "i18next";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StaffEdit({ params }: Props) {
  const { id } = await params;

  return <StaffForm mode="edit" data={{ id }} />;
}
export const metadata: Metadata = {
  title: i18n.t("edit_staff") || "Edit Staff",
  description: i18n.t("edit_staff_description") || "Edit Staff Description",
};

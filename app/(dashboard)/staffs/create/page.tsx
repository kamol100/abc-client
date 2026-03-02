import StaffForm from "@/components/staffs/staff-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function StaffCreate() {
  return <StaffForm />;
}

export const metadata: Metadata = {
  title: t("staff.create.title"),
  description: t("staff.create.title"),
};
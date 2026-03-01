import StaffForm from "@/components/staffs/staff-form";
import i18n from "i18next";
import { Metadata } from "next";

export default async function StaffCreate() {
  return <StaffForm />;
}

export const metadata: Metadata = {
  title: i18n.t("create_staff"),
  description: i18n.t("create_staff_description") || "Create Staff",
};
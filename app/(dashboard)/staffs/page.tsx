import StaffTable from "@/components/staffs/staff-table";
import i18n from "i18next";
import { Metadata } from "next";

export default async function Staffs() {
  return <StaffTable />;
}

export const metadata: Metadata = {
  title: i18n.t("staff.title") || "Staffs",
  description: i18n.t("staff.title") || "Staffs",
};
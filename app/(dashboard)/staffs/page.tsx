import StaffTable from "@/components/staffs/staff-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function Staffs() {
  return <StaffTable />;
}

export const metadata: Metadata = {
  title: t("staff.title"),
  description: t("staff.title"),
};
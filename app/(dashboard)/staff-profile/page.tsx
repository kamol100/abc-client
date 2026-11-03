import StaffAccountPage from "@/components/profiles/staff-account-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: t("staff_account.title"),
  description: t("staff_account.subtitle"),
};

export default function StaffProfilePage() {
  return <StaffAccountPage />;
}

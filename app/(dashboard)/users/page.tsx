import UserTable from "@/components/users/user-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function Users() {
  return <UserTable />;
}

export const metadata: Metadata = {
  title: t("user.title_plural"),
  description: t("user.title_plural"),
};
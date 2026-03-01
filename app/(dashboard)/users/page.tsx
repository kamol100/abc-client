import UserTable from "@/components/users/user-table";
import i18n from "i18next";
import { Metadata } from "next";

export default async function Users() {
  return <UserTable />;
}

export const metadata: Metadata = {
  title: i18n.t("users") || "Users",
  description: i18n.t("users_description") || "Users Description",
};
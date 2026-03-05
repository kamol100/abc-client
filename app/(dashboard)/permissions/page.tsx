import { Metadata } from "next";
import PermissionTable from "@/components/permissions/permission-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("permission.title_plural"),
};

export default function PermissionsPage() {
  return <PermissionTable />;
}


import { Metadata } from "next";
import RoleTable from "@/components/roles/role-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("role.title_plural"),
};

export default function RolesPage() {
    return <RoleTable />;
}

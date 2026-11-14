import type { Metadata } from "next";
import { HelpCategoriesTable } from "@/components/help/admin/help-management";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("help.management.categories"),
};

export default function HelpCategoriesPage() {
  return <HelpCategoriesTable />;
}

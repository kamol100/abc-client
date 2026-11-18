import type { Metadata } from "next";
import { HelpArticlesTable } from "@/components/help/admin/help-management";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("help.management.articles"),
};

export default function HelpArticlesPage() {
  return <HelpArticlesTable />;
}

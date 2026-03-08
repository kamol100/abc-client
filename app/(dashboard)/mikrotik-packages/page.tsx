import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import MikrotikPackagesTable from "@/components/mikrotik-packages/mikrotik-packages-table";

export const metadata: Metadata = {
  title: t("mikrotik_package.title_plural"),
};

export default function MikrotikPackagesPage() {
  return <MikrotikPackagesTable />;
}

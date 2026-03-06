import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import PackageTable from "@/components/packages/package-table";

export const metadata: Metadata = {
  title: t("package.title_plural_reseller"),
};

export default function ResellerPackagesPage() {
  return <PackageTable packageType="reseller" />;
}

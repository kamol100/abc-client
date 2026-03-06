import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import PackageView from "@/components/packages/package-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ClientPackageViewPage({ params }: Props) {
  const { id } = await params;
  return <PackageView packageId={id} />;
}

export const metadata: Metadata = {
  title: t("package.view_title"),
};

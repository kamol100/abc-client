import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import PermissionEntityForm from "@/components/permissions/permission-entity-form";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

export const metadata: Metadata = {
  title: t("permission.title_plural"),
  description: t("permission.title_plural"),
};

export default async function PermissionEntityPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { type } = await searchParams;

  const userType = type === "reseller" || type === "user" ? type : null;

  return <PermissionEntityForm entityId={id} userType={userType} />;
}

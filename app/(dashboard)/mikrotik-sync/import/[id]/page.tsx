import { Metadata } from "next";
import { notFound } from "next/navigation";
import { useFetch } from "@/app/actions";
import MikrotikSyncImportForm from "@/components/mikrotik-sync/mikrotik-sync-import-form";
import { MikrotikSyncImportError } from "@/components/mikrotik-sync/mikrotik-sync-import-error";
import { MikrotikSyncRowSchema } from "@/components/mikrotik-sync/mikrotik-sync-type";
import { t } from "@/lib/i18n/server";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: t("mikrotik_sync.import_title"),
  description: t("mikrotik_sync.import_title"),
};

export default async function MikrotikSyncImportPage({ params }: Props) {
  const { id } = await params;
  const response = await useFetch({
    url: `/mikrotik-sync/${id}`,
  });

  if (response?.error) {
    return <MikrotikSyncImportError error={response.error} />;
  }

  if (!response?.success || !response?.data) {
    notFound();
  }

  const parsed = MikrotikSyncRowSchema.safeParse(response.data);
  if (!parsed.success) {
    notFound();
  }

  return <MikrotikSyncImportForm row={parsed.data} />;
}

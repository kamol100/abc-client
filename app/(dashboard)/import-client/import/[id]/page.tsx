import { Metadata } from "next";
import { notFound } from "next/navigation";
import { useFetch } from "@/app/actions";
import { ImportClientImportError } from "@/app/(dashboard)/import-client/import/[id]/import-client-import-error";
import ImportClientForm from "@/components/import-client/import-client-form";
import { SyncClientRowSchema } from "@/components/import-client/import-client-type";
import { t } from "@/lib/i18n/server";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("import_client.import_title"),
    description: t("import_client.import_title"),
};

export default async function ImportClientImportPage({ params }: Props) {
    const { id } = await params;
    const response = await useFetch({
        url: `/sync-client/${id}`,
    });

    if (response?.error) {
        return <ImportClientImportError error={response.error} />;
    }

    if (!response?.success || !response?.data) {
        notFound();
    }

    const parsedSyncClient = SyncClientRowSchema.safeParse(response.data);
    if (!parsedSyncClient.success) {
        notFound();
    }

    return <ImportClientForm syncClient={parsedSyncClient.data} />;
}

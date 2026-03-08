import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ImportClientTable from "@/components/import-client/import-client-table";

export const metadata: Metadata = {
    title: t("import_client.title_plural"),
    description: t("import_client.title_plural"),
};

export default function ImportClientPage() {
    return <ImportClientTable />;
}

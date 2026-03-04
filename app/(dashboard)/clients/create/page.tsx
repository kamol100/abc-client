import ClientForm from "@/components/clients/client-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function ClientCreate() {
    return <ClientForm mode="create" method="POST" />;
}

export const metadata: Metadata = {
    title: t("client.create_title"),
    description: t("client.create_title"),
};

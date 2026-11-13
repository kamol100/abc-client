import ClientForm from "@/components/clients/client-form";
import { HelpGuideLink } from "@/components/help/help-centre";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function ClientCreate() {
    return (
        <>
            <HelpGuideLink href="/help/clients/create" permission="clients.create" />
            <ClientForm mode="create" method="POST" />
        </>
    );
}

export const metadata: Metadata = {
    title: t("client.create_title"),
    description: t("client.create_title"),
};

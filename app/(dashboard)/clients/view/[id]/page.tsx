import ClientView from "@/components/clients/client-view";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ClientViewPage({ params }: Props) {
    const { id } = await params;

    return <ClientView clientId={id} />;
}

export const metadata: Metadata = {
    title: t("client.view_title"),
};

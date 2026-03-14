import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ClientForm from "@/components/clients/client-form";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("client.edit_title"),
    description: t("client.edit_title"),
};

export default async function ClientEditPage({ params }: Props) {
    const { id } = await params;
    return <ClientForm mode="edit" data={{ id }} />;
}

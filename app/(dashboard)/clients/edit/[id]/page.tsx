import ClientForm from "@/components/clients/client-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ClientEdit({ params }: Props) {
    const { id } = await params;

    return <ClientForm mode="edit" method="PUT" data={{ id }} />;
}

export const metadata: Metadata = {
    title: t("client.edit_title"),
    description: t("client.edit_title"),
};

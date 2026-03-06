import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ResellerForm from "@/components/resellers/reseller-form";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("reseller.edit_title"),
    description: t("reseller.edit_title"),
};

export default async function ResellerEditPage({ params }: Props) {
    const { id } = await params;
    return <ResellerForm mode="edit" data={{ id }} />;
}

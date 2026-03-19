import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ResellerView from "@/components/resellers/reseller-view";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("reseller.view_title"),
    description: t("reseller.view_title"),
};

export default async function ResellerViewPage({ params }: Props) {
    const { id } = await params;
    return <ResellerView resellerId={id} />;
}

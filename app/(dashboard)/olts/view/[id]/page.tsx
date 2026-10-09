import { Metadata } from "next";
import OltView from "@/components/olt/olt-view";
import { t } from "@/lib/i18n/server";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("olt.view_title"),
};

export default async function OltViewPage({ params }: Props) {
    const { id } = await params;
    return <OltView oltId={id} />;
}

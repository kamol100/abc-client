import { Metadata } from "next";
import OltView from "@/components/olt/olt-view";
import { t } from "@/lib/i18n/server";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ test?: string }>;
};

export const metadata: Metadata = {
    title: t("olt.view_title"),
};

export default async function OltViewPage({ params, searchParams }: Props) {
    const { id } = await params;
    const { test } = await searchParams;
    // ?test=1: "Test connection" offered after saving an OLT in the device form.
    return <OltView oltId={id} autoTest={test === "1"} />;
}

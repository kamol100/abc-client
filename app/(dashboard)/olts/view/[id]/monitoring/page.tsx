import { Metadata } from "next";
import OltMonitoring from "@/components/olt/olt-monitoring";
import { t } from "@/lib/i18n/server";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("olt.monitoring_title"),
};

export default async function OltMonitoringPage({ params }: Props) {
    const { id } = await params;
    return <OltMonitoring deviceId={id} />;
}

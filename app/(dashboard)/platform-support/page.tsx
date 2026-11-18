import SupportHome from "@/components/platform-support/support-home";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    searchParams: Promise<{ kind?: string; compose?: string }>;
};

export default async function PlatformSupportPage({ searchParams }: Props) {
    const { kind, compose } = await searchParams;
    return <SupportHome initialKind={kind} compose={compose} />;
}

export const metadata: Metadata = {
    title: t("platform_support.title"),
    description: t("platform_support.title"),
};

import SupportThreadView from "@/components/platform-support/support-thread";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ scope?: string }>;
};

export default async function PlatformSupportIssuePage({ params, searchParams }: Props) {
    const { id } = await params;
    const { scope } = await searchParams;
    const selected = scope === "reseller" || scope === "company" ? scope : "own";
    return <SupportThreadView threadId={id} scope={selected} />;
}

export const metadata: Metadata = {
    title: t("platform_support.issues"),
    description: t("platform_support.issues"),
};

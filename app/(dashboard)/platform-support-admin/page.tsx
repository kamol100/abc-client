import InboxHome from "@/components/platform-support/admin/inbox-home";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    searchParams: Promise<{ kind?: string }>;
};

export default async function PlatformSupportInboxPage({ searchParams }: Props) {
    const { kind } = await searchParams;
    return <InboxHome initialKind={kind} />;
}

export const metadata: Metadata = {
    title: t("platform_support.inbox.title"),
    description: t("platform_support.inbox.title"),
};

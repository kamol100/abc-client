import InboxThread from "@/components/platform-support/admin/inbox-thread";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PlatformSupportInboxThreadPage({ params }: Props) {
    const { id } = await params;
    return <InboxThread key={id} threadId={id} />;
}

export const metadata: Metadata = {
    title: t("platform_support.inbox.title"),
    description: t("platform_support.inbox.title"),
};

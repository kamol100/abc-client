import SmsSendForm from "@/components/sms/sms-send-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    searchParams: Promise<{ phone?: string }>;
};

export default async function SmsSendPage({ searchParams }: Props) {
    const { phone } = await searchParams;
    return <SmsSendForm phone={phone} />;
}

export const metadata: Metadata = {
    title: t("sms_send.title"),
};

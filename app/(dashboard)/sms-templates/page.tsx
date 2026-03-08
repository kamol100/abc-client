import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import SmsTemplateTable from "@/components/sms-templates/sms-template-table";

export const metadata: Metadata = {
  title: t("sms_template.title_plural"),
};

export default function SmsTemplatesPage() {
  return <SmsTemplateTable />;
}

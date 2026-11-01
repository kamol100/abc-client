import FaqPage from "@/components/marketing/faq/faq-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: t("faq_page.meta.title"),
  description: t("faq_page.meta.description"),
};

export default function FaqRoute() {
  return <FaqPage />;
}

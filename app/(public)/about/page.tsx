import AboutPage from "@/components/marketing/about/about-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: t("about_page.meta.title"),
  description: t("about_page.meta.description"),
};

export default function AboutRoute() {
  return <AboutPage />;
}

import HomePage from "@/components/marketing/home/home-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: t("marketing.meta.title"),
  description: t("marketing.meta.description"),
};

export default function HomeRoute() {
  return <HomePage />;
}

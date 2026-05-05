import { fetchHostName } from "@/app/layout";
import HomePage from "@/components/marketing/home/home-page";
import { hostnameHasTenantSubdomain } from "@/lib/helper/helper";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: t("marketing.meta.title"),
  description: t("marketing.meta.description"),
};

const ClientHome = dynamic(() => import("@/components/client-area/home"));

export default async function HomeRoute() {
  const host = await fetchHostName();
  if (hostnameHasTenantSubdomain(host)) {
    return <ClientHome />;
  }
  return <HomePage />;
}

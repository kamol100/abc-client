import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { fetchHostName } from "@/app/layout";
import { auth } from "@/auth/auth";
import HomePage from "@/components/marketing/home/home-page";
import { ADMIN_DASHBOARD_PATH } from "@/lib/auth/routes";
import { hostnameHasTenantSubdomain } from "@/lib/helper/helper";
import { t } from "@/lib/i18n/server";

type SessionWithToken = {
  token?: string;
};

export const metadata: Metadata = {
  title: t("marketing.meta.title"),
  description: t("marketing.meta.description"),
};

const ClientHome = dynamic(() => import("@/components/client-area/home"));

export default async function HomeRoute() {
  const session = (await auth()) as SessionWithToken | null;
  if (session?.token) redirect(ADMIN_DASHBOARD_PATH);

  const host = await fetchHostName();
  if (hostnameHasTenantSubdomain(host)) {
    return <ClientHome />;
  }
  return <HomePage />;
}

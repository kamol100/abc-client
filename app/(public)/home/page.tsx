import HomePage from "@/components/marketing/home/home-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: t("marketing.meta.title"),
  description: t("marketing.meta.description"),
};
export async function getHostName() {
  const requestHeaders = await headers();
  let host = requestHeaders.get("x-forwarded-host");
  if (!host) {
    host = requestHeaders.get("host");
  }
  if (host?.includes(":")) {
    host = host.split(":")[0];
  }
  return host;
}

function hostnameHasTenantSubdomain(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  const host = hostname.toLowerCase().trim();
  if (host === "localhost" || /^127\.\d+\.\d+\.\d+$/.test(host)) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return false;

  const labels = host.split(".").filter(Boolean);
  if (labels.length < 3) return false;
  if (labels.length === 3 && labels[0] === "www") return false;
  return true;
}

const ClientHome = dynamic(() => import("@/components/client-area/home"));

export default async function HomeRoute() {
  const host = await getHostName();
  if (!hostnameHasTenantSubdomain(host)) {
    return <ClientHome />;
  }
  return <HomePage />;
}

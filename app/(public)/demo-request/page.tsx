import DemoRequestPage from "@/components/marketing/demo-request/demo-request-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: t("demo_request.meta.title"),
  description: t("demo_request.meta.description"),
};

export default function DemoRequestRoute() {
  return <DemoRequestPage />;
}

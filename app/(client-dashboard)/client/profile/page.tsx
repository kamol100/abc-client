import ClientAccountPage from "@/components/client-area/client-account-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: t("client_account.title"),
  description: t("client_account.subtitle"),
};

export default function ClientProfilePage() {
  return <ClientAccountPage />;
}

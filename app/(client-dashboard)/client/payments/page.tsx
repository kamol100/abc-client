import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ClientPaymentsTable from "@/components/client-area/payments/client-payments-table";

export const metadata: Metadata = {
  title: t("payment.title_plural"),
};

export default function ClientPaymentsPage() {
  return <ClientPaymentsTable />;
}

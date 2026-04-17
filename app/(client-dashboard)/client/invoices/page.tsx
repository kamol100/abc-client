import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ClientInvoicesTable from "@/components/client-area/invoices/client-invoices-table";

export const metadata: Metadata = {
  title: t("invoice.title_plural"),
};

export default function ClientInvoicesPage() {
  return <ClientInvoicesTable />;
}

import { Metadata } from "next";
import NetworkTable from "@/components/network/network-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("network.title_plural"),
};

export default function NetworksPage() {
  return <NetworkTable />;
}

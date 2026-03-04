import { Metadata } from "next";
import DeviceTable from "@/components/device/device-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("device.title_plural"),
};

export default function DevicesPage() {
  return <DeviceTable />;
}

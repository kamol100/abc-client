import { Metadata } from "next";
import DeviceTypeTable from "@/components/device-type/device-type-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("device_type.title_plural"),
};

export default function DeviceTypesPage() {
  return <DeviceTypeTable />;
}

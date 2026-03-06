import type { Metadata } from "next";
import MikrotikCommandTable from "@/components/mikrotik-commands/mikrotik-command-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("mikrotik_command.title_plural"),
};

export default function MikrotikCommandsPage() {
  return <MikrotikCommandTable />;
}

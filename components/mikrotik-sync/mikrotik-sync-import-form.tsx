"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import { MikrotikSyncImportFieldSchema } from "@/components/mikrotik-sync/mikrotik-sync-form-schema";
import {
  MikrotikSyncImportInput,
  MikrotikSyncImportSchema,
  MikrotikSyncRow,
} from "@/components/mikrotik-sync/mikrotik-sync-type";
import MyButton from "@/components/my-button";
import { usePermissions, useSettings } from "@/context/app-provider";

function toStatus(disabled?: string | null): number {
  return disabled === "true" ? 0 : 1;
}

function mapRowToFormValues(row: MikrotikSyncRow): Partial<MikrotikSyncImportInput> {
  return {
    name: row.name ?? "",
    pppoe_username: row.name ?? "",
    pppoe_password: row.password ?? "",
    mikrotik_profile: row.profile ?? "",
    network_id: row.network_id ?? undefined,
    status: toStatus(row.disabled),
  };
}

export default function MikrotikSyncImportForm({ row }: { row: MikrotikSyncRow }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const { settings } = useSettings();
  const canImport = hasPermission("mikrotik-sync.import");
  const defaultValues = useMemo(() => mapRowToFormValues(row), [row]);

  return (
    <div className="mx-auto flex min-h-0 w-full flex-1 flex-col md:w-3/4">
      {!canImport && (
        <div className="mb-3">
          <MyButton
            action="cancel"
            title={t("common.cancel")}
            onClick={() => router.push("/mikrotik-sync")}
          />
        </div>
      )}
      <AccordionFormBuilder
        formSchema={MikrotikSyncImportFieldSchema({
          mode: "create",
          paymentDeadline: settings.payment_deadline,
        })}
        grids={2}
        data={defaultValues as Record<string, unknown>}
        api={`/mikrotik-sync/${row.id}/import`}
        mode="create"
        schema={MikrotikSyncImportSchema}
        method="POST"
        queryKey="mikrotik-sync"
        successMessage="mikrotik_sync.messages.import_success"
        fullPage
        actionButtonClass="justify-center"
        actionButton={canImport}
        onClose={() => router.push("/mikrotik-sync")}
      />
    </div>
  );
}

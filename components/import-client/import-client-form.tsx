"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { usePermissions } from "@/context/app-provider";
import MyButton from "@/components/my-button";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import ImportClientFormFieldSchema from "@/components/import-client/import-client-form-schema";
import {
    ImportClientFormInput,
    ImportClientFormSchema,
    SyncClientRow,
} from "@/components/import-client/import-client-type";
import { useTranslation } from "react-i18next";

type ImportClientFormProps = {
    syncClient: SyncClientRow;
};

function toStatus(disabled?: string | null): number {
    return disabled === "true" ? 0 : 1;
}

function mapSyncClientToFormValues(
    syncClient: SyncClientRow
): Partial<ImportClientFormInput> {
    return {
        name: syncClient.name ?? "",
        pppoe_username: syncClient.name ?? "",
        pppoe_password: syncClient.password ?? "",
        ip_address: syncClient.ipv6_routes ?? "",
        mikrotik_profile: syncClient.profile ?? "",
        status: toStatus(syncClient.disabled),
    };
}

export default function ImportClientForm({ syncClient }: ImportClientFormProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const canImport = hasPermission("sync-clients.import");
    const defaultValues = useMemo(
        () => mapSyncClientToFormValues(syncClient),
        [syncClient]
    );

    return (
        <div className="mx-auto flex min-h-0 w-full flex-1 flex-col md:w-3/4">
            {!canImport && (
                <div className="mb-3">
                    <MyButton
                        action="cancel"
                        title={t("common.cancel")}
                        onClick={() => router.push("/import-client")}
                    />
                </div>
            )}
            <AccordionFormBuilder
                formSchema={ImportClientFormFieldSchema({ mode: "create" })}
                grids={2}
                data={defaultValues as Record<string, unknown>}
                api={`/sync-client/${syncClient.id}`}
                mode="create"
                schema={ImportClientFormSchema}
                method="POST"
                queryKey="sync-clients"
                successMessage="import_client.messages.import_success"
                fullPage
                actionButtonClass="justify-center"
                actionButton={canImport}
                extraPayload={{ action: "import" }}
                onClose={() => router.push("/import-client")}
            />
        </div>
    );
}

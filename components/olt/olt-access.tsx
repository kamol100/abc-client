"use client";

import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { usePermissions } from "@/context/app-provider";
import { useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { buildOltAccessSchema, OltAccess } from "./olt-type";

function accessFields(hasCommunity: boolean, hasPassword: boolean): FieldConfig[] {
    return [
        {
            type: "dropdown",
            name: "snmp_version",
            label: { labelText: "olt.access.fields.snmp_version", mandatory: true },
            options: [{ value: "v2c", label: "olt.access.snmp_v2c" }],
            isClearable: false,
        },
        {
            type: "password",
            name: "snmp_community",
            label: { labelText: "olt.access.fields.snmp_community", mandatory: !hasCommunity },
            placeholder: hasCommunity ? "olt.access.fields.keep_placeholder" : "olt.access.fields.snmp_community",
        },
        {
            type: "dropdown",
            name: "cli_protocol",
            label: { labelText: "olt.access.fields.cli_protocol" },
            placeholder: "olt.access.fields.cli_protocol_placeholder",
            options: [
                { value: "telnet", label: "olt.access.protocol.telnet" },
                { value: "ssh", label: "olt.access.protocol.ssh" },
            ],
        },
        {
            type: "text",
            name: "cli_username",
            label: { labelText: "olt.access.fields.cli_username" },
            placeholder: "olt.access.fields.cli_username",
            visibleWhen: { field: "cli_protocol", resetValue: null },
        },
        {
            type: "password",
            name: "cli_password",
            label: { labelText: "olt.access.fields.cli_password" },
            placeholder: hasPassword ? "olt.access.fields.keep_placeholder" : "olt.access.fields.cli_password",
            visibleWhen: { field: "cli_protocol", resetValue: "" },
        },
    ];
}

interface Props {
    oltId: string;
    access: OltAccess;
}

/** Access (SNMP / CLI) panel of the OLT page with the Edit access dialog (PUT /olts/{id}/access). */
export default function OltAccessPanel({ oltId, access }: Props) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { relative } = useMonitoringFormat();
    const hasCommunity = !!access.has_snmp_community;

    return (
        <Card className="overflow-hidden">
            <h2 className="border-b bg-muted/60 px-3.5 py-2.5 text-sm font-semibold">{t("olt.access.title")}</h2>
            <div className="flex flex-col gap-2 px-3.5 py-2.5 text-sm">
                {access.configured ? (
                    <>
                        <p>
                            {access.cli_protocol
                                ? t("olt.access.connects_cli", {
                                      host: access.host,
                                      snmp_port: access.snmp_port,
                                      protocol: t(`olt.access.protocol.${access.cli_protocol}`),
                                      cli_port: access.cli_port,
                                  })
                                : t("olt.access.connects", { host: access.host, snmp_port: access.snmp_port })}
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                            {t(access.cli_protocol === "telnet" ? "olt.access.insecure_telnet" : "olt.access.insecure_snmp")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {access.last_poll_at
                                ? t("olt.access.last_poll", { time: relative(access.last_poll_at) })
                                : t("olt.access.never_polled")}
                        </p>
                        {access.last_poll_error && <p className="text-xs text-destructive">{access.last_poll_error}</p>}
                    </>
                ) : (
                    <p className="text-muted-foreground">{t("olt.access.not_configured")}</p>
                )}
                {hasPermission("olts.access-settings") && (
                    <div>
                        <MyDialog
                            size="xl"
                            title="olt.access.edit_title"
                            trigger={
                                <MyButton type="button" variant="outline">
                                    {t("olt.access.edit")}
                                </MyButton>
                            }
                        >
                            <FormBuilder
                                formSchema={accessFields(hasCommunity, !!access.has_cli_password)}
                                grids={2}
                                schema={buildOltAccessSchema(!hasCommunity)}
                                api={`/olts/${oltId}/access`}
                                // "create" posts to `api` itself (no /{id} suffix, no edit hydration); method makes it a PUT.
                                mode="create"
                                method="PUT"
                                queryKey="olts"
                                successMessage="olt.access.saved"
                                data={{
                                    snmp_version: access.snmp_version ?? "v2c",
                                    snmp_community: "",
                                    cli_protocol: access.cli_protocol ?? null,
                                    cli_username: access.cli_username ?? "",
                                    cli_password: "",
                                }}
                            />
                        </MyDialog>
                    </div>
                )}
            </div>
        </Card>
    );
}

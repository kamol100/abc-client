"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, KeyRound, PlugZap, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Card from "@/components/card";
import { DeleteModal } from "@/components/delete-modal";
import FormBuilder, { VisibleFormField } from "@/components/form-wrapper/form-builder";
import { GRID_STYLES } from "@/components/form-wrapper/form-builder-type";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { formatDateTime, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { usePermissions, useSetting } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import OltAccessCommunityField from "./olt-access-community-field";
import OltAccessFormFieldSchema, { whereToFindRows } from "./olt-access-form-schema";
import { suggestedProtocol, switchProtocolPayload, translateAccessType, type CliProtocol } from "./olt-test-result";
import OltTestResultView from "./olt-test-result-view";
import { buildOltAccessSchema, OltAccess, toAccessFormValues, toAccessPayload, type DetectCommunityResult } from "./olt-type";
import { pollFailed } from "./olt-access-alert";
import { newestTestResult, type OltAccessTest } from "./use-olt-access-test";



/** Small label chip of the access summary; `alert` rings it amber (the test suggests changing it). */
function Chip({ children, alert, title }: { children: React.ReactNode; alert?: boolean; title?: string }) {
    return (
        <span
            title={title}
            className={cn(
                "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums",
                alert
                    ? "border-amber-500 bg-amber-500/15 text-amber-900 ring-2 ring-amber-500/40 dark:text-amber-100"
                    : "bg-muted/60"
            )}
        >
            {alert && <AlertTriangle className="h-3 w-3" aria-hidden />}
            {children}
        </span>
    );
}

interface Props {
    oltId: string;
    access: OltAccess;
    /** "Test connection" state, owned by the page so the retest banner can run it too. */
    test: OltAccessTest;
    /** The OLT's Device IP, shown before access is configured (the access object has `host` after). */
    deviceIp?: string | null;
    /** The OLT's vendor (bdcom | vsol | huawei | generic | null): brand-specific community help. */
    vendor?: string | null;
    /** Run "Test connection" once on mount (link from the device form: /olts/view/<id>?test=1). */
    autoTest?: boolean;
    onAutoTestDone?: () => void;
}

/**
 * Access (SNMP / CLI) card of the OLT page: what the app connects to, the last poll and the last
 * "Test connection" result (shown without pressing anything), and the Test / Edit / Remove actions.
 */
export default function OltAccessPanel({ oltId, access, test, deviceIp, vendor, autoTest, onAutoTestDone }: Props) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { relative } = useMonitoringFormat();
    const [editOpen, setEditOpen] = useState(false);
    const canEdit = hasPermission("olts.access-settings");
    const canTest = hasPermission("olts.access-test");
    const canRemove = hasPermission("olts.access-remove");
    // Company setting (Settings → OLT Polling); 0 / unset = off.
    const pollInterval = Number(useSetting("olt_poll_interval") ?? 0) || 0;
    // Users without olts.access-settings get only the status part (no host, credentials, error text or steps).
    const restricted = !!access.restricted;
    const result = newestTestResult(test.result, access.last_test);
    const suggested = access.configured ? suggestedProtocol(result, access.cli_protocol) : null;

    // One-click "Switch to Telnet / SSH": the saved fields with only the protocol changed (secrets kept), then re-test.
    const switchProtocol = useApiMutation<OltAccess, Record<string, unknown>>({
        url: `/olts/${oltId}/access`,
        method: "PUT",
        invalidateKeys: "olts",
        successMessage: "olt.access.saved",
        onSuccess: () => {
            if (canTest) test.run();
        },
    });

    // "Detect from OLT" (olts.access-settings): logs in with the saved CLI access and reads the community from the
    // OLT's configuration (BDCOM, VSOL); found → saved, then Test connection runs with it. 422 (no CLI login, v3,
    // refused IP) and 429 are the hook's toast.
    const detect = useApiMutation<DetectCommunityResult>({
        url: `/olts/${oltId}/access/detect-community`,
        method: "POST",
        invalidateKeys: "olts",
        defaultErrorMessage: "olt.access.detect.failed",
        onSuccess: (data) => {
            const fallback = t(data?.ok ? "olt.access.detect.found" : "olt.access.detect.failed");
            const params = {
                protocol: access.cli_protocol ? t(`olt.access.protocol.${access.cli_protocol}`) : "",
                ...(data?.params ?? {}),
                access_type: translateAccessType(data?.access_type ?? data?.params?.access_type, t),
            };
            const text = data?.message_key
                ? t(data.message_key, { ...params, defaultValue: data.message ?? fallback })
                : (data?.message ?? fallback);
            if (!data?.ok) {
                toast.error(text);
                return;
            }
            toast.success(data.replaced ? `${text} ${t("olt.access.detect.replaced")}` : text);
            if (canTest) test.run();
        },
    });

    // ?test=1 from the device form: test once the access is known to exist.
    const autoTestDone = useRef(false);
    const runTest = test.run;
    useEffect(() => {
        if (!autoTest || autoTestDone.current) return;
        autoTestDone.current = true;
        if (access.configured && canTest) runTest();
        onAutoTestDone?.();
    }, [autoTest, access.configured, canTest, runTest, onAutoTestDone]);

    const host = access.host || deviceIp || "—";
    const protocolLabel = access.cli_protocol ? t(`olt.access.protocol.${access.cli_protocol}`) : null;

    return (
        <Card id="olt-access" className="overflow-hidden scroll-mt-4">
            <h2 className="border-b bg-muted/60 px-3.5 py-2.5 text-sm font-semibold">{t("olt.access.title")}</h2>
            <div className="flex flex-col gap-2.5 px-3.5 py-2.5 text-sm">
                {access.configured && restricted ? (
                    <>
                        <p>{t("olt.access.connects_to", { host })}</p>
                        <p className="text-xs text-muted-foreground">
                            {access.last_poll_at ? (
                                <span title={formatDateTime(access.last_poll_at)}>
                                    {t("olt.access.last_poll", { time: relative(access.last_poll_at) })}
                                </span>
                            ) : (
                                t("olt.access.never_polled")
                            )}
                        </p>
                        {pollFailed(access) && (
                            <p className="text-xs text-destructive">
                                {t(access.last_poll_error_key || "olt.poll.failed", { defaultValue: t("olt.poll.failed") })}
                            </p>
                        )}
                        {access.last_test_ok != null && (
                            <p
                                className={cn("text-xs", access.last_test_ok ? "text-green-700 dark:text-green-400" : "text-destructive")}
                                title={access.last_test_at ? formatDateTime(access.last_test_at) : undefined}
                            >
                                {t(access.last_test_ok ? "olt.test.last_ok" : "olt.test.last_failed", {
                                    time: access.last_test_at ? relative(access.last_test_at) : "",
                                }).trim()}
                            </p>
                        )}
                    </>
                ) : access.configured ? (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <p>{t("olt.access.connects_to", { host })}</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Chip>
                                    {t(access.snmp_version === "v3" ? "olt.access.snmp_v3" : "olt.access.snmp_v2c")} ·{" "}
                                    {access.snmp_port ?? 161}
                                </Chip>
                                {access.cli_protocol ? (
                                    <Chip
                                        alert={!!suggested}
                                        title={
                                            suggested
                                                ? t("olt.test.switch_hint", { protocol: t(`olt.access.protocol.${suggested}`) })
                                                : undefined
                                        }
                                    >
                                        {protocolLabel}
                                        {access.cli_port ? ` · ${access.cli_port}` : ""}
                                        {access.cli_username ? ` · ${access.cli_username}` : ""}
                                    </Chip>
                                ) : (
                                    <Chip alert={!!suggested}>{t("olt.access.no_cli")}</Chip>
                                )}
                            </div>
                        </div>
                        {(access.snmp_version !== "v3" || access.cli_protocol === "telnet") && (
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                                {t(access.cli_protocol === "telnet" ? "olt.access.insecure_telnet" : "olt.access.insecure_snmp")}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {access.last_poll_at ? (
                                <span title={formatDateTime(access.last_poll_at)}>
                                    {t("olt.access.last_poll", { time: relative(access.last_poll_at) })}
                                </span>
                            ) : (
                                t("olt.access.never_polled")
                            )}{" "}
                            ·{" "}
                            {pollInterval > 0
                                ? t("olt.access.auto_poll_every", { count: pollInterval })
                                : t("olt.access.auto_poll_off")}
                            {hasPermission("company-settings.access") && (
                                <>
                                    {" "}
                                    <Link href="/settings/olt" className="font-medium underline-offset-2 hover:underline">
                                        {t("olt.access.auto_poll_change")}
                                    </Link>
                                </>
                            )}
                        </p>
                        {pollFailed(access) && (
                            <p className="break-words text-xs text-destructive">
                                <span className="font-semibold">{t("olt.poll.last_error")}:</span>{" "}
                                {access.last_poll_error_key
                                    ? t(access.last_poll_error_key, { defaultValue: access.last_poll_error ?? t("olt.poll.failed") })
                                    : (access.last_poll_error ?? t("olt.poll.failed"))}
                                {access.last_poll_error_key === "olt.poll.internal_error" && access.last_poll_error && (
                                    <span className="block text-muted-foreground">{access.last_poll_error}</span>
                                )}
                            </p>
                        )}
                        {test.running ? (
                            <p role="status" className="flex items-center gap-2 rounded-md border p-3 text-muted-foreground">
                                <PlugZap className="h-4 w-4 animate-pulse" aria-hidden />
                                {t("olt.test.running")}
                            </p>
                        ) : result ? (
                            <OltTestResultView
                                result={result}
                                cliProtocol={access.cli_protocol}
                                collapsible
                                onSwitchProtocol={
                                    canEdit
                                        ? (protocol: CliProtocol) => switchProtocol.mutate(switchProtocolPayload(access, protocol))
                                        : undefined
                                }
                                switching={switchProtocol.isPending}
                            />
                        ) : (
                            canTest && <p className="text-xs text-muted-foreground">{t("olt.test.never")}</p>
                        )}
                    </>
                ) : (
                    <p className="text-muted-foreground">{t("olt.access.not_configured")}</p>
                )}

                {(canEdit || (access.configured && (canTest || canRemove))) && (
                    <div className="flex flex-wrap gap-2">
                        {access.configured && canTest && (
                            <MyButton type="button" variant="default" loading={test.running} onClick={() => test.run()}>
                                {!test.running && <PlugZap className="h-4 w-4" />}
                                {t("olt.test.button")}
                            </MyButton>
                        )}
                        {canEdit && (
                            <MyButton type="button" variant="outline" onClick={() => setEditOpen(true)}>
                                <KeyRound className="h-4 w-4" />
                                {t(access.configured ? "olt.access.edit" : "olt.access.configure")}
                            </MyButton>
                        )}
                        {access.configured && canRemove && (
                            <DeleteModal
                                api_url={`/olts/${oltId}/access`}
                                keys="olts"
                                confirmMessage="olt.access.remove_confirm"
                                buttonText="olt.access.remove"
                                message="olt.access.removed"
                            >
                                <MyButton type="button" variant="outline" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    {t("olt.access.remove")}
                                </MyButton>
                            </DeleteModal>
                        )}
                    </div>
                )}
            </div>

            {canEdit && (
                <MyDialog size="xl" title="olt.access.edit_title" open={editOpen} onOpenChange={setEditOpen}>
                    <p className="mb-4 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                        {t("olt.access.help_direct", { host })}
                    </p>
                    <details className="mb-4 rounded-md border p-3 text-xs">
                        <summary className="cursor-pointer font-medium">{t("olt.access.where.title")}</summary>
                        <div className="mt-2 space-y-1.5 text-muted-foreground">
                            {whereToFindRows(vendor).map((key) => (
                                <p key={key} className={cn(key === vendor && "rounded bg-muted/60 px-1.5 py-1")}>
                                    <span className="font-medium text-foreground">{t(`olt.access.where.${key}_title`)}</span>{" "}
                                    {t(`olt.access.where.${key}`)}
                                </p>
                            ))}
                        </div>
                    </details>
                    <FormBuilder
                        formSchema={OltAccessFormFieldSchema(access, vendor)}
                        grids={2}
                        schema={buildOltAccessSchema(access)}
                        api={`/olts/${oltId}/access`}
                        // "create" sends to `api` itself (no /{id} suffix, no edit hydration); method makes it a PUT.
                        mode="create"
                        method="PUT"
                        queryKey="olts"
                        successMessage="olt.access.saved"
                        data={toAccessFormValues(access)}
                        transformPayload={(values) => toAccessPayload(values, access)}
                        // Saving does not test anything: run the test now so the result shows right away.
                        onSuccess={() => {
                            if (canTest) test.run();
                        }}
                    >
                        {(renderField) => (
                            <div className={`m-auto grid w-full gap-4 ${GRID_STYLES[2]}`}>
                                {OltAccessFormFieldSchema(access, vendor).map((field) =>
                                    field.name === "snmp_community" ? (
                                        <OltAccessCommunityField
                                            key={field.name}
                                            field={field}
                                            renderField={renderField}
                                            access={access}
                                            vendor={vendor}
                                            onDetect={() => detect.mutate()}
                                            detecting={detect.isPending}
                                        />
                                    ) : (
                                        <VisibleFormField key={field.name} field={field}>
                                            {renderField(field)}
                                        </VisibleFormField>
                                    )
                                )}
                            </div>
                        )}
                    </FormBuilder>
                </MyDialog>
            )}
        </Card>
    );
}

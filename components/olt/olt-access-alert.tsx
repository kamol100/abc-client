"use client";

import { AlertTriangle, PlugZap } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { formatDateTime, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { firstFailedStep, stepMessage, suggestedProtocol, suggestionStep, testPassed } from "./olt-test-result";
import type { OltAccess } from "./olt-type";

const RETEST_KEY = "olt.poll.retest_required";

/** Poll failed? Users without olts.access-settings only get `last_poll_failed` (no error text). */
export function pollFailed(access: OltAccess): boolean {
    return access.last_poll_failed ?? !!access.last_poll_error;
}

/** Last test failed? The full result when we have it, else the restricted `last_test_ok`. */
export function lastTestFailed(access: OltAccess): boolean {
    if (access.last_test) return !testPassed(access.last_test);
    return access.last_test_ok === false;
}

interface Props {
    access: OltAccess;
    /** "Test connection" from the banner (users with olts.access-test). */
    onTest?: () => void;
    testing?: boolean;
}

/**
 * Top-of-page warnings, shown without pressing anything:
 *  - the Device IP changed (`retest_required`): polling and ONU reboot are paused until a test passes;
 *  - the last poll or the last "Test connection" failed, with the time and the reason.
 */
export default function OltAccessAlert({ access, onTest, testing }: Props) {
    const { t } = useTranslation();
    const { relative } = useMonitoringFormat();
    if (!access.configured) return null;

    const retest = !!access.retest_required;
    const lastTest = access.last_test ?? null;
    const testFailed = lastTestFailed(access);
    // The retest banner already says why polling stopped.
    const pollFailedShown = pollFailed(access) && !(retest && access.last_poll_error_key === RETEST_KEY);
    if (!retest && !testFailed && !pollFailedShown) return null;

    const failedStep = testFailed && lastTest ? firstFailedStep(lastTest) : null;
    const suggested = testFailed && lastTest ? suggestedProtocol(lastTest, access.cli_protocol) : null;
    const hintStep = suggested ? suggestionStep(lastTest) : null;
    const time = (value: string | null | undefined) => (value ? relative(value) : t("monitoring.never"));
    const testedAt = lastTest?.tested_at ?? access.last_test_at ?? null;
    // A generic message the app wrote (internal error, stopped job) is translated, else the OLT's own text; a
    // restricted user's plain "olt.poll.failed" adds nothing to the heading.
    const key = access.last_poll_error_key ?? null;
    const pollReason =
        key && key !== "olt.poll.failed"
            ? t(key, { defaultValue: access.last_poll_error ?? "" })
            : (access.last_poll_error ?? null);
    // The stored text of an internal error carries a log reference: keep it visible under the translation.
    const pollDetail = key && key !== "olt.poll.failed" && access.last_poll_error ? access.last_poll_error : null;

    return (
        <div className="flex flex-col gap-2">
            {retest && (
                <div
                    role="alert"
                    className="flex flex-col gap-2 rounded-md border border-amber-500/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100 sm:flex-row sm:items-center"
                >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <strong>{t("olt.alert.retest_title")}</strong>
                            <span>{t("olt.alert.retest_text")}</span>
                        </div>
                    </div>
                    {onTest && (
                        <MyButton type="button" variant="default" className="shrink-0 self-start sm:self-center" loading={testing} onClick={onTest}>
                            {!testing && <PlugZap className="h-4 w-4" />}
                            {t("olt.test.button")}
                        </MyButton>
                    )}
                </div>
            )}

            {(testFailed || pollFailedShown) && (
                <div role="alert" className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        {pollFailedShown && (
                            <p className="break-words">
                                <strong className="text-destructive" title={access.last_poll_at ? formatDateTime(access.last_poll_at) : undefined}>
                                    {t("olt.alert.poll_failed", { time: time(access.last_poll_at) })}
                                </strong>{" "}
                                {pollReason && <span className="text-muted-foreground">{pollReason}</span>}
                                {pollDetail && pollDetail !== pollReason && (
                                    <span className="block text-xs text-muted-foreground">{pollDetail}</span>
                                )}
                            </p>
                        )}
                        {testFailed && (
                            <p className="break-words">
                                <strong className="text-destructive" title={testedAt ? formatDateTime(testedAt) : undefined}>
                                    {t("olt.alert.test_failed", { time: time(testedAt) })}
                                </strong>{" "}
                                {failedStep && failedStep !== hintStep && (
                                    <span className="text-muted-foreground">
                                        {t(`olt.test.step.${failedStep.key}`, { defaultValue: failedStep.key })}: {stepMessage(failedStep, t)}
                                    </span>
                                )}
                            </p>
                        )}
                        {suggested && (
                            <p className="rounded-md border border-amber-500/60 bg-amber-500/15 px-2.5 py-1.5 font-semibold text-amber-900 dark:text-amber-100">
                                {(hintStep && stepMessage(hintStep, t)) ||
                                    t("olt.test.switch_hint", { protocol: t(`olt.access.protocol.${suggested}`) })}
                            </p>
                        )}
                        {!access.restricted && (
                            <a href="#olt-access" className="self-start text-xs font-medium underline-offset-2 hover:underline">
                                {t("olt.alert.details")}
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

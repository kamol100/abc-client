"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRightLeft, CheckCircle2, ChevronDown, MinusCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { formatDateTime, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { formatKey } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import {
    stepMessage,
    stepStatus,
    suggestedProtocol,
    suggestionStep,
    testHasWarning,
    testPassed,
    testSteps,
    LABELLED_STEP_KEYS,
    type CliProtocol,
    type OltTestResult,
    type OltTestStep,
    type TestStepStatus,
} from "./olt-test-result";

export const STEP_STYLE: Record<TestStepStatus, { Icon: typeof CheckCircle2; className: string }> = {
    ok: { Icon: CheckCircle2, className: "text-green-600 dark:text-green-400" },
    fail: { Icon: XCircle, className: "text-destructive" },
    warning: { Icon: AlertTriangle, className: "text-amber-600 dark:text-amber-400" },
    skipped: { Icon: MinusCircle, className: "text-muted-foreground" },
};

interface Props {
    result: OltTestResult;
    /** The CLI protocol saved on the access: no suggestion is shown when it already matches. */
    cliProtocol: CliProtocol | null | undefined;
    /** One-click "Switch to Telnet / SSH" (only with olts.access-settings). */
    onSwitchProtocol?: (protocol: CliProtocol) => void;
    switching?: boolean;
    /** A passing result starts collapsed to its heading; failures always show every step. */
    collapsible?: boolean;
    className?: string;
}

/** Step-by-step "Test connection" result: green / amber / red / grey icons, messages and the protocol hint. */
export default function OltTestResultView({ result, cliProtocol, onSwitchProtocol, switching, collapsible, className }: Props) {
    const { t } = useTranslation();
    const { relative } = useMonitoringFormat();
    const passed = testPassed(result);
    const warning = passed && testHasWarning(result);
    const [expanded, setExpanded] = useState(false);
    // Only a clean pass can be folded away; failures and warnings always list the steps.
    const foldable = !!collapsible && passed && !warning;
    const showSteps = !foldable || expanded;
    const steps = testSteps(result);
    const suggested = suggestedProtocol(result, cliProtocol);
    const hintStep = suggestionStep(result);
    const applied = result.detected?.applied ?? [];

    const label = (step: OltTestStep) =>
        LABELLED_STEP_KEYS.includes(step.key) ? t(`olt.test.step.${step.key}`) : formatKey(step.key);

    const heading = passed ? (warning ? "olt.test.passed_with_warning" : "olt.test.passed") : "olt.test.failed";
    const tone = passed ? (warning ? "warning" : "ok") : "fail";
    const { Icon: HeadingIcon, className: headingIconClass } = STEP_STYLE[tone];

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "flex flex-col gap-2.5 rounded-md border p-3 text-sm",
                tone === "ok" && "border-green-600/30 bg-green-600/5",
                tone === "warning" && "border-amber-500/40 bg-amber-500/5",
                tone === "fail" && "border-destructive/40 bg-destructive/5",
                className
            )}
        >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <HeadingIcon className={cn("h-4 w-4 shrink-0", headingIconClass)} aria-hidden />
                <strong>{t(heading)}</strong>
                {result.tested_at && (
                    <span className="text-xs text-muted-foreground" title={formatDateTime(result.tested_at)}>
                        {t("olt.test.tested", { time: relative(result.tested_at) })}
                    </span>
                )}
                {foldable && (
                    <button
                        type="button"
                        className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                        aria-expanded={expanded}
                        onClick={() => setExpanded((open) => !open)}
                    >
                        {t(expanded ? "olt.test.hide_steps" : "olt.test.show_steps")}
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} aria-hidden />
                    </button>
                )}
            </div>

            {suggested && (
                <div className="flex flex-col gap-2 rounded-md border border-amber-500/60 bg-amber-500/15 p-2.5 text-amber-900 dark:text-amber-100">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <p className="font-semibold">
                            {(hintStep && stepMessage(hintStep, t)) ||
                                t("olt.test.switch_hint", { protocol: t(`olt.access.protocol.${suggested}`) })}
                        </p>
                    </div>
                    {onSwitchProtocol && (
                        <MyButton
                            type="button"
                            variant="default"
                            className="self-start"
                            loading={switching}
                            onClick={() => onSwitchProtocol(suggested)}
                        >
                            {!switching && <ArrowRightLeft className="h-4 w-4" />}
                            {t("olt.test.switch_to", { protocol: t(`olt.access.protocol.${suggested}`) })}
                        </MyButton>
                    )}
                </div>
            )}

            {showSteps && steps.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {steps.map((step) => {
                        const status = stepStatus(step);
                        const { Icon, className: iconClass } = STEP_STYLE[status];
                        const detail = stepMessage(step, t);
                        return (
                            <li key={step.key} className="flex items-start gap-2">
                                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} aria-hidden />
                                <div className="flex min-w-0 flex-col">
                                    <span className={cn("font-medium", status === "skipped" && "text-muted-foreground")}>
                                        {label(step)}
                                        <span className="sr-only"> ({t(`olt.test.status.${status}`)})</span>
                                    </span>
                                    {detail && (
                                        <span
                                            className={cn(
                                                "break-words text-xs",
                                                status === "fail" && "text-destructive",
                                                status === "warning" && "text-amber-800 dark:text-amber-300",
                                                (status === "ok" || status === "skipped") && "text-muted-foreground"
                                            )}
                                        >
                                            {detail}
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {applied.length > 0 && result.detected && (
                <p className="text-xs text-muted-foreground">
                    {t("olt.test.detected_applied", {
                        vendor: result.detected.vendor ? t(`olt.vendor.${result.detected.vendor}`, { defaultValue: result.detected.vendor }) : "",
                        model: result.detected.model ?? "",
                    }).trim()}
                </p>
            )}
        </div>
    );
}

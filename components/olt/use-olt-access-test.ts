"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useApiMutation from "@/hooks/use-api-mutation";
import { apiErrorKey } from "@/lib/helper/helper";
import { addressDeniedResult, testHasWarning, testPassed, type OltTestResult } from "./olt-test-result";

/**
 * POST /olts/{id}/access/test (olts.access-test). The API stores the result as `access.last_test`, and may fill
 * the device's empty vendor/model from SNMP, so the OLT page ("olts") is refetched afterwards.
 * 422 (nothing to test) and 429 (2 tests a minute per OLT) arrive as the hook's error toast; a Device IP refused
 * by the address policy (422 olt.address.denied) is also shown as a failed result.
 */
export function useOltAccessTest(oltId: string) {
    const { t } = useTranslation();
    const [result, setResult] = useState<OltTestResult | null>(null);
    const { mutate, isPending } = useApiMutation<OltTestResult>({
        url: `/olts/${oltId}/access/test`,
        method: "POST",
        invalidateKeys: "olts",
        defaultErrorMessage: "olt.test.request_failed",
        onSuccess: (data) => {
            setResult(data);
            if (!testPassed(data)) toast.error(t("olt.test.failed"));
            else if (testHasWarning(data)) toast.warning(t("olt.test.passed_with_warning"));
            else toast.success(t("olt.test.passed"));
        },
        onError: (error) => {
            const denied = addressDeniedResult(apiErrorKey(error));
            if (denied) setResult(denied);
        },
    });

    const run = useCallback(() => mutate(), [mutate]);

    return { run, running: isPending, result };
}

export type OltAccessTest = ReturnType<typeof useOltAccessTest>;

/** The newer of the fresh result and the stored `access.last_test` (they are the same right after a test). */
export function newestTestResult(
    fresh: OltTestResult | null | undefined,
    stored: OltTestResult | null | undefined
): OltTestResult | null {
    if (!fresh) return stored ?? null;
    if (!stored) return fresh;
    const time = (result: OltTestResult) => (result.tested_at ? new Date(result.tested_at).getTime() : 0);
    return time(stored) > time(fresh) ? stored : fresh;
}

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";
import useApiMutation from "@/hooks/use-api-mutation";
import { pollFinished, POLL_WAIT_MS, type PollWait } from "./olt-poll";

interface Props {
    oltId: string;
    lastPollAt: string | null | undefined;
    lastPollError: string | null | undefined;
    /** Restricted users get these instead of the error text. */
    lastPollFailed?: boolean;
    lastPollErrorKey?: string | null;
    /** Owned by the page, which refetches every 3 s while it is set. */
    wait: PollWait | null;
    onWaitChange: (wait: PollWait | null) => void;
    /** Why polling cannot work (e.g. no vendor driver): the button is disabled with this as its tooltip. */
    disabledReason?: string | null;
}

/** "Poll now" (POST /olts/{id}/poll, olts.poll): queues a poll (202), then the page refetches until last_poll_at moves. */
export default function OltPollButton({
    oltId,
    lastPollAt,
    lastPollError,
    lastPollFailed,
    lastPollErrorKey,
    wait,
    onWaitChange,
    disabledReason,
}: Props) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const poll = useApiMutation<{ message?: string; last_poll_at?: string | null }>({
        url: `/olts/${oltId}/poll`,
        method: "POST",
        successMessage: "olt.poll.queued",
        onSuccess: (data) => onWaitChange({ since: Date.now(), before: data?.last_poll_at ?? lastPollAt ?? null }),
    });

    useEffect(() => {
        if (wait === null) return;
        if (pollFinished(wait, lastPollAt)) {
            onWaitChange(null);
            // Fresh PON/ONU data for the ONU list and this OLT's client list.
            ["onus", "olt-clients"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
            if (lastPollFailed ?? !!lastPollError) {
                const reason =
                    lastPollErrorKey && lastPollErrorKey !== "olt.poll.failed"
                        ? t(lastPollErrorKey, { defaultValue: lastPollError ?? "" })
                        : (lastPollError ?? "");
                toast.error(reason ? t("olt.poll.done_failed", { error: reason }) : t("olt.poll.failed"));
            } else {
                toast.success(t("olt.poll.done"));
            }
            return;
        }
        const timer = setTimeout(() => {
            onWaitChange(null);
            toast.info(t("olt.poll.timeout"));
        }, Math.max(0, wait.since + POLL_WAIT_MS - Date.now()));
        return () => clearTimeout(timer);
    }, [lastPollAt, lastPollError, lastPollFailed, lastPollErrorKey, wait, onWaitChange, queryClient, t]);

    const busy = poll.isPending || wait !== null;

    const button = (
        <MyButton type="button" variant="outline" loading={busy} disabled={!!disabledReason} onClick={() => poll.mutate()}>
            {!busy && <RefreshCw className="h-4 w-4" />}
            {t(busy ? "olt.poll.running" : "olt.poll.button")}
        </MyButton>
    );

    // A disabled button gets no pointer events: the wrapper carries the explanation.
    return disabledReason ? (
        <span title={disabledReason} className="inline-flex cursor-not-allowed">
            {button}
            <span className="sr-only">{disabledReason}</span>
        </span>
    ) : (
        button
    );
}

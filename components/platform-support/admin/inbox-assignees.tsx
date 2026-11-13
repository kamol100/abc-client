"use client";

import { useTranslation } from "react-i18next";
import { parseAssignees, platformQueryKey } from "@/components/platform-support/admin/inbox-model";
import { supportQueryRetry } from "@/components/platform-support/support-model";
import { useProfile } from "@/context/app-provider";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";

export function InboxAssigneeSelect({
    enabled,
    value,
    onChange,
    id,
    mode,
}: {
    enabled: boolean;
    value: string;
    onChange: (value: string) => void;
    id: string;
    mode: "filter" | "assign";
}) {
    const { t } = useTranslation();
    const { profile } = useProfile();
    const identity = profile?.id ?? "";
    const query = useApiQuery<ApiResponse<unknown>>({
        queryKey: platformQueryKey({ identity, resource: "assignees" }),
        url: "platform-support-admin/assignees",
        pagination: false,
        enabled: enabled && Boolean(identity),
        refetchInterval: false,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
    });
    if (!enabled) return null;
    const agents = parseAssignees(query.data?.data);
    return (
        <select
            id={id}
            aria-label={t("platform_support.inbox.filters.assignee")}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            {mode === "filter" ? (
                <option value="">{t("platform_support.inbox.filters.any_assignee")}</option>
            ) : null}
            {mode === "filter" ? (
                <option value="unassigned">{t("platform_support.inbox.unassigned_agent")}</option>
            ) : (
                <option value="">{t("platform_support.inbox.unassigned_agent")}</option>
            )}
            {agents.map((agent) => (
                <option key={agent.uuid} value={agent.uuid}>{agent.name}</option>
            ))}
        </select>
    );
}

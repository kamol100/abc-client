"use client";

import { useTranslation } from "react-i18next";
import MyBadge from "@/components/my-badge";
import { cn } from "@/lib/utils";

// Up mirrors the soft red Down badge in green; MyBadge "success" would follow the theme primary.
const STYLES = {
    up: { type: "success", className: "bg-green-600/15 text-green-700 dark:text-green-400" },
    down: { type: "decline", className: "" },
    unknown: { type: "pending", className: "" },
} as const;

interface Props {
    state?: string | null;
    /** Replaces the default Up / Down / Unknown text (e.g. Online / Offline). */
    label?: string;
    className?: string;
}

export default function MonitorStateBadge({ state, label, className }: Props) {
    const { t } = useTranslation();
    const key = state === "up" || state === "down" ? state : "unknown";
    const style = STYLES[key];

    return (
        <MyBadge type={style.type} variant="soft" size="sm" className={cn(style.className, className)}>
            {label ?? t(`monitoring.state.${key}`)}
        </MyBadge>
    );
}

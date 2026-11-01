"use client";

import { useTranslation } from "react-i18next";
import MyBadge from "@/components/my-badge";

const STYLES = {
    up: { type: "success" },
    down: { type: "decline" },
    unknown: { type: "pending" },
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
        <MyBadge type={style.type} variant="soft" size="sm" className={className}>
            {label ?? t(`monitoring.state.${key}`)}
        </MyBadge>
    );
}

"use client";

import { useTranslation } from "react-i18next";
import MyBadge from "@/components/my-badge";
import type { PortStatus } from "./olt-ports";

// Red for a link that is down, muted for a port the operator disabled.
const TYPES = { up: "success", link_down: "decline", disabled: "closed", unknown: "pending" } as const;

export function PortStatusBadge({ status }: { status: PortStatus }) {
    const { t } = useTranslation();
    return (
        <MyBadge type={TYPES[status]} variant="soft" size="sm" className="whitespace-nowrap">
            {t(`olt.ports.status.${status}`)}
        </MyBadge>
    );
}

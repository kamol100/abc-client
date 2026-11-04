"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientRow } from "@/components/clients/client-type";
import MyTooltip from "@/components/my-tooltip";
import { cn } from "@/lib/utils";

type Props = { client: ClientRow };

const ClientZoneAddressCell = ({ client }: Props) => {
    const inactive = client.status === 0;
    const address = client.current_address?.trim() ?? "";

    return (
        <div className="flex min-w-[140px] flex-col gap-0.5">
            <span className={cn("line-clamp-1 text-sm font-semibold", inactive && "text-destructive")}>
                {client.zone?.name || "—"}
            </span>
            <ClientAddressLine address={address} inactive={inactive} />
            <span className={cn("text-xs", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                {client.network?.name || "—"}
            </span>
        </div>
    );
};

function ClientAddressLine({ address, inactive }: { address: string; inactive: boolean }) {
    const { t } = useTranslation();
    const textRef = useRef<HTMLSpanElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflows, setOverflows] = useState(false);
    const labelKey = expanded ? "client.address.show_less" : "client.address.show_more";

    useEffect(() => {
        setExpanded(false);
    }, [address]);

    useLayoutEffect(() => {
        const element = textRef.current;
        if (!element || expanded || !address) return;

        const measure = () => {
            if (element.clientWidth === 0) return;

            const probe = element.cloneNode(true) as HTMLSpanElement;
            probe.classList.remove("line-clamp-1");
            probe.style.position = "absolute";
            probe.style.visibility = "hidden";
            probe.style.pointerEvents = "none";
            probe.style.width = `${element.clientWidth}px`;
            probe.style.display = "block";
            probe.style.overflow = "visible";
            probe.style.webkitLineClamp = "unset";
            element.parentElement?.appendChild(probe);
            setOverflows(probe.scrollHeight > element.clientHeight + 1);
            probe.remove();
        };

        measure();

        if (typeof ResizeObserver === "undefined") return;

        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [address, expanded]);

    return (
        <div className={cn("flex min-w-0 gap-0.5", expanded ? "items-start" : "items-center")}>
            <span
                ref={textRef}
                className={cn(
                    "min-w-0 flex-1 text-sm",
                    expanded ? "break-words" : "line-clamp-1",
                    inactive ? "text-destructive/80" : "text-foreground",
                )}
            >
                {address || "—"}
            </span>
            {address && (overflows || expanded) ? (
                <MyTooltip content={labelKey}>
                    <button
                        type="button"
                        className="inline-flex shrink-0 items-center p-0 text-muted-foreground hover:text-foreground"
                        aria-expanded={expanded}
                        aria-label={t(labelKey)}
                        onClick={(event) => {
                            event.stopPropagation();
                            setExpanded((value) => !value);
                        }}
                    >
                        <ChevronDown
                            className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
                            aria-hidden
                        />
                    </button>
                </MyTooltip>
            ) : null}
        </div>
    );
}

export default ClientZoneAddressCell;

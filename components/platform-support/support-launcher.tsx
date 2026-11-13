"use client";

import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import Link from "next/link";
import { Headset } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { MyDrawer } from "@/components/my-drawer";
import {
    supportAccessDenied,
    supportPollInterval,
    supportQueryKey,
    supportQueryRetry,
} from "@/components/platform-support/support-model";
import { usePermissions, useProfile } from "@/context/app-provider";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SupportPresence {
    documentVisible: boolean;
    online: boolean;
}

const SupportPresenceContext = createContext<SupportPresence | null>(null);

export function useSupportPresence(): SupportPresence {
    return useContext(SupportPresenceContext) ?? { documentVisible: true, online: true };
}

function usePresenceState(): SupportPresence {
    const [documentVisible, setDocumentVisible] = useState(true);
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const sync = () => {
            setDocumentVisible(document.visibilityState === "visible");
            setOnline(navigator.onLine);
        };
        sync();
        document.addEventListener("visibilitychange", sync);
        window.addEventListener("online", sync);
        window.addEventListener("offline", sync);
        return () => {
            document.removeEventListener("visibilitychange", sync);
            window.removeEventListener("online", sync);
            window.removeEventListener("offline", sync);
        };
    }, []);

    return { documentVisible, online };
}

function SupportPanelLinks({ onNavigate }: { onNavigate: () => void }) {
    const { t } = useTranslation();
    const links = [
        { href: "/platform-support?kind=issue&compose=issue", label: "platform_support.actions.report_issue", testId: "platform-support-report" },
        { href: "/platform-support?kind=chat&compose=chat", label: "platform_support.actions.chat", testId: "platform-support-chat" },
        { href: "/platform-support", label: "platform_support.actions.my_requests", testId: "platform-support-requests" },
    ];
    return (
        <div className="flex flex-col gap-2" data-testid="platform-support-panel">
            {links.map((link) => (
                <Link
                    key={link.testId}
                    href={link.href}
                    data-testid={link.testId}
                    onClick={onNavigate}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                    {t(link.label)}
                </Link>
            ))}
        </div>
    );
}

function SupportLauncher() {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { profile } = useProfile();
    const presence = useSupportPresence();
    const mobile = useIsMobile();
    const [ready, setReady] = useState(false);
    const [open, setOpen] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const allowed = hasPermission("platform-support.access");
    const identity = profile?.id ?? "";

    useEffect(() => setReady(true), []);

    const summary = useApiQuery<ApiResponse<{ unread_messages?: number }>>({
        queryKey: supportQueryKey({ identity, scope: "own", resource: "summary" }),
        url: "platform-support/summary",
        params: { scope: "own" },
        pagination: false,
        enabled: allowed && Boolean(identity) && !blocked,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
        refetchInterval: (query) => supportPollInterval({
            surface: "summary",
            documentVisible: presence.documentVisible,
            online: presence.online,
            signedIn: allowed && Boolean(identity),
            accessible: !blocked && !supportAccessDenied(query.state.error),
            failureCount: query.state.fetchFailureCount,
        }),
    });

    useEffect(() => {
        if (supportAccessDenied(summary.error)) setBlocked(true);
    }, [summary.error]);

    if (!allowed) return null;

    const unread = blocked ? 0 : summary.data?.data?.unread_messages ?? 0;
    const close = () => {
        setOpen(false);
        buttonRef.current?.focus();
    };
    const label = t("platform_support.launcher.label", { count: unread });

    return (
        <>
            <MyButton
                ref={buttonRef}
                type="button"
                variant="default"
                data-testid="platform-support-launcher"
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={label}
                className="fixed bottom-4 right-4 z-40"
                onClick={() => setOpen((current) => !current)}
            >
                <Headset className="h-4 w-4" />
                <span>{t("platform_support.launcher.title")}</span>
                {unread > 0 && (
                    <span className="rounded-full bg-background px-1.5 text-xs text-foreground">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </MyButton>
            {ready && open && mobile && (
                <MyDrawer open={open} onOpenChange={(next) => (next ? setOpen(true) : close())} side="bottom" title="platform_support.title">
                    <SupportPanelLinks onNavigate={close} />
                </MyDrawer>
            )}
            {ready && open && !mobile && (
                <div
                    role="dialog"
                    aria-label={t("platform_support.title")}
                    className={cn("fixed bottom-20 right-4 z-40 w-80 rounded-lg border border-border bg-background p-4 shadow-lg")}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") close();
                    }}
                >
                    <SupportPanelLinks onNavigate={close} />
                </div>
            )}
        </>
    );
}

export function SupportRuntime({ children }: PropsWithChildren) {
    const presence = usePresenceState();
    return (
        <SupportPresenceContext.Provider value={presence}>
            {children}
            <SupportLauncher />
        </SupportPresenceContext.Provider>
    );
}

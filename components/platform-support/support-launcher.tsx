"use client";

import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { Headset } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HelpLauncherPanel } from "@/components/help/help-launcher-panel";
import MyButton from "@/components/my-button";
import { MyDrawer } from "@/components/my-drawer";
import { SupportWidgetState } from "@/components/platform-support/support-widget";
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

function focusable(container: HTMLElement): HTMLElement[] {
    return [...container.querySelectorAll<HTMLElement>("a, button, input, textarea, select, [tabindex]:not([tabindex='-1'])")]
        .filter((node) => !node.hasAttribute("disabled"));
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
    const openedAt = useRef(0);
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

    const unread = !allowed || blocked ? 0 : summary.data?.data?.unread_messages ?? 0;
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
                onClick={() => {
                setOpen((current) => {
                    if (!current) openedAt.current = Date.now();
                    return !current;
                });
            }}
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
                <MyDrawer
                    open={open}
                    onOpenChange={(next) => {
                        if (!next && Date.now() - openedAt.current < 400) return;
                        if (next) setOpen(true);
                        else close();
                    }}
                    side="bottom"
                    size="lg"
                    title="help.title"
                >
                    <HelpLauncherPanel support={allowed} onNavigate={close} />
                </MyDrawer>
            )}
            {ready && open && !mobile && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("help.title")}
                    className={cn("fixed bottom-20 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background p-4 shadow-lg")}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            event.preventDefault();
                            close();
                            return;
                        }
                        if (event.key !== "Tab") return;
                        const container = event.currentTarget;
                        const nodes = focusable(container);
                        if (nodes.length === 0) return;
                        const first = nodes[0];
                        const last = nodes[nodes.length - 1];
                        if (event.shiftKey && document.activeElement === first) {
                            event.preventDefault();
                            last?.focus();
                        } else if (!event.shiftKey && document.activeElement === last) {
                            event.preventDefault();
                            first?.focus();
                        }
                    }}
                >
                    <HelpLauncherPanel support={allowed} onNavigate={close} />
                </div>
            )}
        </>
    );
}

export function SupportRuntime({ children }: PropsWithChildren) {
    const presence = usePresenceState();
    return (
        <SupportPresenceContext.Provider value={presence}>
            <SupportWidgetState>
                {children}
                <SupportLauncher />
            </SupportWidgetState>
        </SupportPresenceContext.Provider>
    );
}

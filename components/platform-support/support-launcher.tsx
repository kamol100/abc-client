"use client";

import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { Headset } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HelpLauncherActions, HelpLauncherPanel } from "@/components/help/help-launcher-panel";
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

export function SupportLauncher() {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { profile } = useProfile();
    const presence = useSupportPresence();
    const mobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const openedAt = useRef(0);
    const allowed = hasPermission("platform-support.access");
    const identity = profile?.id ?? "";

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

    const unread = !allowed || blocked || supportAccessDenied(summary.error) ? 0 : summary.data?.data?.unread_messages ?? 0;
    const close = () => setOpen(false);
    const label = t("platform_support.launcher.label", { count: unread });

    return (
        <MyDrawer
            open={open}
            autoFocus
            onOpenChange={(next) => {
                if (!next && Date.now() - openedAt.current < 400) return;
                if (next) { openedAt.current = Date.now(); setOpen(true); }
                else close();
            }}
            side={mobile ? "bottom" : "right"}
            size={mobile ? "lg" : "md"}
            title="help.title"
            description="help.redesign.drawer_intro"
            className={mobile ? "h-[85dvh] max-h-[85dvh]" : "w-full max-w-[min(100vw,28rem)]"}
            footer={allowed && <HelpLauncherActions onNavigate={close} />}
            trigger={<MyButton
                type="button" variant="outline" size="icon" icon={false}
                data-testid="platform-support-launcher"
                aria-expanded={open} aria-haspopup="dialog" aria-label={label}
                className="relative">
                <Headset className="size-4" aria-hidden />
                {unread > 0 && <span aria-hidden className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {unread > 99 ? "99+" : unread}
                </span>}
            </MyButton>}
        >
            <HelpLauncherPanel onNavigate={close} />
        </MyDrawer>
    );
}

export function SupportRuntime({ children }: PropsWithChildren) {
    const presence = usePresenceState();
    return (
        <SupportPresenceContext.Provider value={presence}>
            <SupportWidgetState>
                {children}
            </SupportWidgetState>
        </SupportPresenceContext.Provider>
    );
}

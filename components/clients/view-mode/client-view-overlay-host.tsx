"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePermissions } from "@/context/app-provider";
import {
    CLIENT_VIEW_PARAM,
    clientViewPageHref,
    isOverlayMode,
    withClientViewParam,
} from "@/components/clients/view-mode/client-view-mode";
import { takeClientViewOpenedInApp } from "@/components/clients/view-mode/client-view-overlay-history";
import { useClientViewMode } from "@/components/clients/view-mode/use-client-view-mode";

// Loaded on the first open, so pages do not ship the overlay (or the client view) until it is used.
const ClientViewOverlay = dynamic(() => import("@/components/clients/view-mode/client-view-overlay"), { ssr: false });

/**
 * Mounted once in the dashboard layout. Shows the client view as a modal or drawer while the URL has
 * `?view_client={id}`; the page underneath stays mounted, so its filters, page and scroll are kept.
 * With the setting on "Same page" or "New tab", such a URL (pasted or shared) opens the full page instead.
 */
export default function ClientViewOverlayHost() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const mode = useClientViewMode();
    const { hasPermission } = usePermissions();
    const clientId = searchParams.get(CLIENT_VIEW_PARAM)?.trim() || null;
    const overlay = isOverlayMode(mode);

    useEffect(() => {
        if (clientId && !overlay) router.replace(clientViewPageHref(clientId));
    }, [clientId, overlay, router]);

    // Closed by the browser's Back button: forget that it was opened in the app.
    useEffect(() => {
        if (!clientId) takeClientViewOpenedInApp();
    }, [clientId]);

    if (!clientId || !isOverlayMode(mode) || !hasPermission("clients.show")) return null;

    const currentUrlWith = (id: string | null) => withClientViewParam(pathname, window.location.search, id);

    // Native history calls: they update useSearchParams without refetching the page underneath.
    const close = () => {
        if (takeClientViewOpenedInApp()) window.history.back();
        else window.history.replaceState(null, "", currentUrlWith(null));
    };

    return (
        <ClientViewOverlay
            clientId={clientId}
            mode={mode}
            onClose={close}
            // replace: Back still closes the overlay instead of stepping back through clients.
            onNavigate={(id) => window.history.replaceState(null, "", currentUrlWith(id))}
            onOpenFullPage={() => {
                takeClientViewOpenedInApp();
                router.push(clientViewPageHref(clientId));
            }}
        />
    );
}

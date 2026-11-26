"use client";

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClientDetailPrefetch } from "@/components/clients/client-detail-query";
import { clientViewPageHref, isOverlayMode, withClientViewParam } from "@/components/clients/view-mode/client-view-mode";
import { preloadClientView } from "@/components/clients/view-mode/client-view-lazy";
import {
    markClientViewOpenedInApp,
    setClientViewOpening,
} from "@/components/clients/view-mode/client-view-overlay-history";
import { useClientViewOpening } from "@/components/clients/view-mode/use-client-view-opening";
import { useClientViewMode } from "@/components/clients/view-mode/use-client-view-mode";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target"> & {
    clientId: string;
};

/** A plain left click; Ctrl/Cmd/Shift/Alt or middle clicks keep the browser's own behavior (new tab, window…). */
function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Every "view client" link. The href is always the full page, so copying the link or opening it in a new
 * tab works as usual. A plain click follows the company's "Open client view in" setting:
 * same page, new tab, or a modal / drawer over the current page (`?view_client={id}`, so Back closes it).
 * Resting on the link prefetches the client unless it opens in a new tab.
 * Forwards its ref and props, so it can be the child of `asChild` components (menu items, buttons).
 */
const ClientViewLink = forwardRef<HTMLAnchorElement, Props>(function ClientViewLink(
    { clientId, onClick, onPointerEnter, onPointerLeave, onFocus, onBlur, ...props },
    ref,
) {
    const mode = useClientViewMode();
    const pathname = usePathname();
    const prefetch = useClientDetailPrefetch(clientId, mode !== "new_tab");
    const opening = useClientViewOpening(clientId);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || !isOverlayMode(mode) || !isPlainLeftClick(event)) return;
        // Already on this client's full page: nothing to open over it.
        if (pathname === clientViewPageHref(clientId)) return;
        event.preventDefault();
        markClientViewOpenedInApp();
        setClientViewOpening(clientId);
        // Native pushState syncs with useSearchParams without a server round trip (router.push would
        // refetch the page underneath before the overlay could show). Back still closes it.
        window.history.pushState(null, "", withClientViewParam(pathname, window.location.search, clientId));
    };

    return (
        <Link
            ref={ref}
            href={clientViewPageHref(clientId)}
            target={mode === "new_tab" ? "_blank" : undefined}
            rel={mode === "new_tab" ? "noopener noreferrer" : undefined}
            {...props}
            aria-busy={opening || undefined}
            onClick={handleClick}
            onPointerEnter={(event) => {
                onPointerEnter?.(event);
                prefetch.onPointerEnter?.();
                // Modal / drawer: have the view's code ready before the click.
                if (isOverlayMode(mode)) preloadClientView();
            }}
            onPointerLeave={(event) => {
                onPointerLeave?.(event);
                prefetch.onPointerLeave?.();
            }}
            onFocus={(event) => {
                onFocus?.(event);
                prefetch.onFocus?.();
                if (isOverlayMode(mode)) preloadClientView();
            }}
            onBlur={(event) => {
                onBlur?.(event);
                prefetch.onBlur?.();
            }}
        />
    );
});

export default ClientViewLink;

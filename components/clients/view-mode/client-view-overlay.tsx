"use client";

import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import ClientView from "@/components/clients/client-view";
import { useClientDetail, useClientDetailPrefetch } from "@/components/clients/client-detail-query";
import { findClientListContext } from "@/components/clients/client-list-cache";
import { cn } from "@/lib/utils";

type Props = {
    clientId: string;
    mode: "modal" | "drawer";
    onClose: () => void;
    /** Show another client in the same overlay (Previous / Next). */
    onNavigate: (clientId: string) => void;
    onOpenFullPage: () => void;
};

const PANEL_CLASSES: Record<Props["mode"], string> = {
    // Full screen on phones; a large centered window from md up.
    modal: cn(
        "left-1/2 top-1/2 h-[100dvh] w-screen -translate-x-1/2 -translate-y-1/2",
        "md:h-[min(88vh,920px)] md:w-[min(1240px,calc(100vw-3rem))] md:rounded-xl md:border",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
    ),
    // Full screen on phones; a right-side panel from md up, the list still visible on its left.
    drawer: cn(
        "inset-y-0 right-0 h-full w-screen md:w-[min(1060px,86vw)] md:border-l",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
    ),
};

/**
 * The client view in a modal or a right-side drawer. One Radix dialog for both: Esc, the scrim and the X
 * close it; dialogs opened from the view (Pay, SMS, Lock…) stack on top and Esc closes only the top one.
 * The top bar shows who is open, Previous / Next within the list page it was opened from, and
 * "Open full page".
 */
export default function ClientViewOverlay({ clientId, mode, onClose, onNavigate, onOpenFullPage }: Props) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data } = useClientDetail(clientId);
    const client = data?.data;
    const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const list = findClientListContext(queryClient, clientId);
    const previousId = list && list.index > 0 ? list.ids[list.index - 1] : undefined;
    const nextId = list && list.index < list.ids.length - 1 ? list.ids[list.index + 1] : undefined;
    const prefetchPrevious = useClientDetailPrefetch(previousId, Boolean(previousId));
    const prefetchNext = useClientDetailPrefetch(nextId, Boolean(nextId));

    // Previous / Next keep the overlay open: start the next client at the top.
    useEffect(() => {
        if (scrollRoot) scrollRoot.scrollTop = 0;
    }, [clientId, scrollRoot]);

    const title = client?.name?.trim() || t("client.view_title");
    const identity = client?.pppoe_username || client?.client_id || "";
    const position = list
        ? t("client.view_overlay.position", { current: list.index + 1, total: list.ids.length })
        : "";

    return (
        <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
            <DialogPortal>
                <DialogOverlay className={mode === "drawer" ? "bg-black/30" : "bg-black/50"} />
                <DialogPrimitive.Content
                    ref={contentRef}
                    aria-describedby={undefined}
                    // Focus the panel, not the first button, so no tooltip pops up on open.
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                        contentRef.current?.focus();
                    }}
                    data-client-view-overlay={mode}
                    className={cn(
                        "fixed z-50 flex flex-col overflow-hidden bg-background shadow-lg outline-none duration-200",
                        PANEL_CLASSES[mode],
                    )}
                >
                    <div className="flex shrink-0 items-center gap-2 border-b py-2 pl-4 pr-2 md:pl-5">
                        <div className="flex min-w-0 flex-col">
                            <DialogPrimitive.Title className="truncate text-sm font-semibold">{title}</DialogPrimitive.Title>
                            <span className="h-4 truncate text-xs text-muted-foreground">
                                {[identity, position].filter(Boolean).join(" · ")}
                            </span>
                        </div>
                        <div className="ml-auto flex shrink-0 items-center gap-1">
                            {list && (
                                <>
                                    <MyButton
                                        variant="ghost"
                                        size="icon"
                                        disabled={!previousId}
                                        onClick={() => previousId && onNavigate(previousId)}
                                        tooltip="client.view_overlay.previous"
                                        aria-label={t("client.view_overlay.previous")}
                                        {...prefetchPrevious}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </MyButton>
                                    <MyButton
                                        variant="ghost"
                                        size="icon"
                                        disabled={!nextId}
                                        onClick={() => nextId && onNavigate(nextId)}
                                        tooltip="client.view_overlay.next"
                                        aria-label={t("client.view_overlay.next")}
                                        {...prefetchNext}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </MyButton>
                                    <span className="mx-1 h-5 w-px bg-border" aria-hidden />
                                </>
                            )}
                            <MyButton
                                variant="ghost"
                                size="icon"
                                onClick={onOpenFullPage}
                                tooltip="client.view_overlay.open_full_page"
                                aria-label={t("client.view_overlay.open_full_page")}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </MyButton>
                            <MyButton
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                tooltip="client.view_overlay.close"
                                aria-label={t("client.view_overlay.close")}
                            >
                                <X className="h-4 w-4" />
                            </MyButton>
                        </div>
                    </div>
                    <div ref={setScrollRoot} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-5">
                        <ClientView clientId={clientId} variant="overlay" scrollRoot={scrollRoot} />
                    </div>
                </DialogPrimitive.Content>
            </DialogPortal>
        </DialogPrimitive.Root>
    );
}

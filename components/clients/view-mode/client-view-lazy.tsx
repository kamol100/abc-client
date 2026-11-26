"use client";

import dynamic from "next/dynamic";
import ClientViewSkeleton from "@/components/clients/client-view-skeleton";

const loadClientView = () => import("@/components/clients/client-view");

/**
 * The client view for the modal / drawer, loaded on first use. `ssr: false` + `loading` give it its own
 * Suspense boundary, and that boundary matters twice:
 * - the overlay frame opens at once and shows the skeleton while the view's code downloads;
 * - anything inside the view that suspends later (e.g. a dialog whose dropdown code is still loading)
 *   stops here. If it reached a boundary above the overlay, React would hide and re-show the overlay,
 *   which re-registers it as the top Radix layer and leaves the dialog opened from the view unclickable.
 */
export const LazyClientView = dynamic(loadClientView, {
    ssr: false,
    loading: () => <ClientViewSkeleton showTables={false} variant="overlay" />,
});

/** Starts downloading the view's code (on hover of a view link), so the overlay opens with it ready. */
export function preloadClientView(): void {
    void loadClientView().catch(() => undefined);
}

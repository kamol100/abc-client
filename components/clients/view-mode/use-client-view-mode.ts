"use client";

import { useSettings } from "@/context/app-provider";
import { clientViewModeFromSettings, type ClientViewMode } from "@/components/clients/view-mode/client-view-mode";

/** How "view client" links open, from the company (or reseller) settings. */
export function useClientViewMode(): ClientViewMode {
    const { settings } = useSettings();
    return clientViewModeFromSettings(settings);
}

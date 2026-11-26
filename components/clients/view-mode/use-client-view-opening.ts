"use client";

import { useSyncExternalStore } from "react";
import {
    getClientViewOpening,
    subscribeClientViewOpening,
} from "@/components/clients/view-mode/client-view-overlay-history";

/**
 * True from the click on a view link of this client until its modal / drawer is on screen.
 * For a control that swaps its icon for a spinner meanwhile. Always false in "Same page" and "New tab".
 */
export function useClientViewOpening(clientId: string | undefined): boolean {
    return useSyncExternalStore(
        subscribeClientViewOpening,
        () => Boolean(clientId) && getClientViewOpening() === clientId,
        () => false,
    );
}

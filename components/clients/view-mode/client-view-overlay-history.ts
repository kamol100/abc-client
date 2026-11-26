/**
 * Whether the open client overlay was opened by a click in this tab (router.push) or arrived with the
 * page (a pasted or refreshed `?view_client=` URL). Closing goes Back in the first case, so the history
 * has no extra entry; in the second there is nothing to go back to, so it removes the parameter instead.
 * Module state, so a refresh or a new tab starts with "not opened in app".
 */
let openedInApp = false;

export function markClientViewOpenedInApp(): void {
    openedInApp = true;
}

/** Reads and clears the flag. */
export function takeClientViewOpenedInApp(): boolean {
    const value = openedInApp;
    openedInApp = false;
    return value;
}

/*
 * The client whose modal / drawer is being opened: set by the click, cleared when the overlay is on
 * screen. Lets the clicked control show a spinner in between (useClientViewOpening).
 */
let openingClientId: string | null = null;
let openingTimer: ReturnType<typeof setTimeout> | null = null;
const openingListeners = new Set<() => void>();

/** If the overlay never appears (e.g. navigation failed), the spinner must not stay forever. */
const OPENING_TIMEOUT_MS = 10_000;

export function setClientViewOpening(clientId: string | null): void {
    if (openingTimer) clearTimeout(openingTimer);
    openingTimer = clientId ? setTimeout(() => setClientViewOpening(null), OPENING_TIMEOUT_MS) : null;
    if (openingClientId === clientId) return;
    openingClientId = clientId;
    openingListeners.forEach((listener) => listener());
}

export function getClientViewOpening(): string | null {
    return openingClientId;
}

export function subscribeClientViewOpening(listener: () => void): () => void {
    openingListeners.add(listener);
    return () => {
        openingListeners.delete(listener);
    };
}

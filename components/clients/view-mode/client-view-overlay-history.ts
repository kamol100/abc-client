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

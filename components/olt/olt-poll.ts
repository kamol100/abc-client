// "Poll now" bookkeeping (pure, unit-tested): the page watches GET /olts/{id} until access.last_poll_at moves.

/** How long the page watches a queued poll before it gives up (the API suggests ~60 s). */
export const POLL_WAIT_MS = 90_000;

/** A queued poll: when it was queued and access.last_poll_at at that moment (the 202 response). */
export interface PollWait {
    since: number;
    before: string | null;
}

/** The poll finished once last_poll_at differs from the value the 202 response returned. */
export function pollFinished(wait: PollWait, lastPollAt: string | null | undefined): boolean {
    return !!lastPollAt && lastPollAt !== wait.before;
}

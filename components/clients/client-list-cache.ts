import type { QueryClient } from "@tanstack/react-query";
import type { PaginatedApiResponse } from "@/hooks/use-api-query";
import { ClientRow, getClientId } from "@/components/clients/client-type";

/** Query-key prefixes of the client lists (`ClientTable`) whose pages hold client rows. */
const CLIENT_LIST_KEYS = [["clients"], ["reseller-clients"]] as const;

/**
 * Finds a client in a client list page that is already in the React Query cache.
 * The row is a summary (no wallet, password, ONUs, reseller…), so it is only fit as placeholder data
 * for the client view, never as the detail itself.
 */
export function findClientInListCache(queryClient: QueryClient, clientId: string): ClientRow | undefined {
    for (const queryKey of CLIENT_LIST_KEYS) {
        for (const [, cached] of queryClient.getQueriesData<PaginatedApiResponse<ClientRow>>({ queryKey })) {
            // The ["clients"] prefix also matches detail and per-client queries; only list pages have a row array.
            const rows = cached?.data?.data;
            if (!Array.isArray(rows)) continue;
            const row = rows.find((candidate) => getClientId(candidate) === clientId);
            if (row) return row;
        }
    }
    return undefined;
}

/** The client ids of a cached list page, in table order, and where `clientId` sits in it. */
export type ClientListContext = { ids: string[]; index: number };

/**
 * The list page a client was opened from, for Previous / Next in the client overlay. When several cached
 * pages hold the client, the most recently loaded one wins. Undefined when no cached list holds it
 * (e.g. opened from an invoice), and Previous / Next are then hidden.
 */
export function findClientListContext(queryClient: QueryClient, clientId: string): ClientListContext | undefined {
    let best: (ClientListContext & { updatedAt: number }) | undefined;
    for (const queryKey of CLIENT_LIST_KEYS) {
        for (const query of queryClient.getQueryCache().findAll({ queryKey })) {
            const rows = (query.state.data as PaginatedApiResponse<ClientRow> | undefined)?.data?.data;
            if (!Array.isArray(rows)) continue;
            const ids = rows.map((row) => getClientId(row)).filter((id): id is string => Boolean(id));
            const index = ids.indexOf(clientId);
            if (index === -1) continue;
            if (!best || query.state.dataUpdatedAt > best.updatedAt) {
                best = { ids, index, updatedAt: query.state.dataUpdatedAt };
            }
        }
    }
    return best ? { ids: best.ids, index: best.index } : undefined;
}

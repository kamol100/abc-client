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

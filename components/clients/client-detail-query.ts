"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/hooks/use-api-query";
import { apiGet } from "@/lib/api/api-get";
import { apiRequestError } from "@/lib/api/api-request-error";
import type { ClientRow } from "@/components/clients/client-type";

/** Query key of the client view's detail query (`useApiQuery` with `pagination: false` and no params). */
export function clientDetailQueryKey(clientId: string) {
    return ["clients", "detail", clientId] as const;
}

/** Same request and error handling as the client view's `useApiQuery`, so a prefetch fills the same cache entry. */
export async function fetchClientDetail(clientId: string): Promise<ApiResponse<ClientRow>> {
    const response = (await apiGet({ url: `/clients/${clientId}` })) as ApiResponse<ClientRow> | null;
    if (!response?.success) throw apiRequestError(response);
    return response;
}

/** Long enough that moving the pointer across the table does not fire a request per row. */
export const CLIENT_PREFETCH_DELAY_MS = 150;

type PrefetchHandlers = {
    onPointerEnter?: () => void;
    onPointerLeave?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
};

/**
 * Event handlers for a link to `/clients/view/{id}`: resting on it (or focusing it) loads the client detail
 * into the cache, so the view renders without waiting. Returns no handlers when `enabled` is false, e.g.
 * when the view opens in a new tab, which has its own cache and could not use the result.
 * A detail loaded in the last 30 s (the default staleTime) is not requested again.
 */
export function useClientDetailPrefetch(clientId: string | undefined, enabled = true): PrefetchHandlers {
    const queryClient = useQueryClient();
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancel = () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
    };

    useEffect(() => cancel, []);

    if (!enabled || !clientId) return {};

    const start = () => {
        cancel();
        timer.current = setTimeout(() => {
            timer.current = null;
            void queryClient.prefetchQuery({
                queryKey: clientDetailQueryKey(clientId),
                queryFn: () => fetchClientDetail(clientId),
            });
        }, CLIENT_PREFETCH_DELAY_MS);
    };

    return { onPointerEnter: start, onPointerLeave: cancel, onFocus: start, onBlur: cancel };
}

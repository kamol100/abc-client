import { apiProxyPath } from "@/lib/api/api-proxy-url";

type ApiGetOptions = {
    url: string;
    version?: string;
};

/**
 * GET through the read proxy Route Handler. Returns the API envelope exactly like `useFetch` did,
 * including `{ success: false, … }` when the network fails or the body is not JSON.
 */
export async function apiGet({ url, version = "v1" }: ApiGetOptions): Promise<unknown> {
    try {
        const response = await fetch(apiProxyPath(url, version), {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
        return await response.json();
    } catch {
        return {
            success: false,
            message: "Unable to process request",
            error: null,
            status: 500,
        };
    }
}

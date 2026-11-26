import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    CLIENT_PREFETCH_DELAY_MS,
    clientDetailQueryKey,
    useClientDetailPrefetch,
} from "@/components/clients/client-detail-query";

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({
    useFetch,
}));

function ViewLink({ clientId, enabled = true }: { clientId: string; enabled?: boolean }) {
    const prefetch = useClientDetailPrefetch(clientId, enabled);
    return <a href={`/clients/view/${clientId}`} {...prefetch}>view</a>;
}

function renderLink(queryClient: QueryClient, props: { clientId: string; enabled?: boolean }) {
    render(
        <QueryClientProvider client={queryClient}>
            <ViewLink {...props} />
        </QueryClientProvider>
    );
    return screen.getByRole("link", { name: "view" });
}

function detailCalls() {
    return useFetch.mock.calls.filter((call) => call[0]?.url === "/clients/client-1");
}

describe("useClientDetailPrefetch", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.useFakeTimers();
        queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30_000 } } });
        useFetch.mockReset();
        useFetch.mockResolvedValue({ success: true, data: { id: "client-1", name: "Kamal" } });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // লিংকে পয়েন্টার একটু থামলে ক্লায়েন্টের বিস্তারিত ভিউ পেজের একই কুয়েরি-কী-তে ক্যাশে জমা হয় কি না যাচাই করি।
    it("View link prefetch: resting on the link loads the client detail into the view page's cache entry", async () => {
        const link = renderLink(queryClient, { clientId: "client-1" });

        fireEvent.pointerEnter(link);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(CLIENT_PREFETCH_DELAY_MS);
        });

        expect(detailCalls()).toHaveLength(1);
        expect(queryClient.getQueryData(clientDetailQueryKey("client-1"))).toEqual({
            success: true,
            data: { id: "client-1", name: "Kamal" },
        });
    });

    // পয়েন্টার দ্রুত লিংকের উপর দিয়ে চলে গেলে কোনো অনুরোধ যায় না কি না যাচাই করি।
    it("View link prefetch: passing over the link without resting sends no request", async () => {
        const link = renderLink(queryClient, { clientId: "client-1" });

        fireEvent.pointerEnter(link);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(CLIENT_PREFETCH_DELAY_MS - 50);
        });
        fireEvent.pointerLeave(link);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(CLIENT_PREFETCH_DELAY_MS);
        });

        expect(detailCalls()).toHaveLength(0);
    });

    // সম্প্রতি লোড হওয়া বিস্তারিত থাকলে আবার হোভার করলেও নতুন অনুরোধ যায় না কি না যাচাই করি।
    it("View link prefetch: a detail loaded in the last 30 seconds is not requested again", async () => {
        queryClient.setQueryData(clientDetailQueryKey("client-1"), { success: true, data: { id: "client-1" } });
        const link = renderLink(queryClient, { clientId: "client-1" });

        fireEvent.pointerEnter(link);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(CLIENT_PREFETCH_DELAY_MS);
        });

        expect(detailCalls()).toHaveLength(0);
    });

    // নতুন ট্যাবে খোলার সেটিং চালু থাকলে (enabled=false) হোভারে কোনো অনুরোধ যায় না কি না যাচাই করি।
    it("View link prefetch: sends no request when prefetch is turned off, as for views opened in a new tab", async () => {
        const link = renderLink(queryClient, { clientId: "client-1", enabled: false });

        fireEvent.pointerEnter(link);
        fireEvent.focus(link);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(CLIENT_PREFETCH_DELAY_MS * 2);
        });

        expect(detailCalls()).toHaveLength(0);
    });

    // API ব্যর্থ উত্তর দিলে সেটি ক্যাশে সফল ডেটা হিসেবে জমা হয় না কি না যাচাই করি।
    it("View link prefetch: a failed response is not stored as the client detail", async () => {
        useFetch.mockResolvedValue({ success: false, message: "Forbidden", status: 403 });
        const link = renderLink(queryClient, { clientId: "client-1" });

        fireEvent.focus(link);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(CLIENT_PREFETCH_DELAY_MS);
        });

        expect(detailCalls()).toHaveLength(1);
        expect(queryClient.getQueryData(clientDetailQueryKey("client-1"))).toBeUndefined();
    });
});

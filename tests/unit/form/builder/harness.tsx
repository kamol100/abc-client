/**
 * Shared helpers for the form builder tests.
 *
 * These tests lock the builder's current behaviour before the refactor. They run the
 * real FormBuilder, FormWrapper, field components, useApiQuery and useApiMutation.
 * Only the network edge (`useFetch`) is faked, so each test can see the exact URL,
 * method and payload the form would send.
 *
 * Each test file must mock these modules itself (vi.mock is per file):
 *   vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
 *   vi.mock("react-i18next", ...), vi.mock("react-toastify", ...), vi.mock("next/navigation", ...)
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import { useFetch } from "@/app/actions";

export type ApiRequest = {
    url: string;
    method: string;
    data?: unknown;
};

type ApiHandler = (request: ApiRequest) => unknown;

const fetchMock = () => vi.mocked(useFetch);

/**
 * Fake the API. `handler` may return a response for a request, or undefined to use
 * the default: an empty list for GET, `{ success: true }` for a write.
 */
export function mockApi(handler?: ApiHandler) {
    fetchMock().mockReset();
    fetchMock().mockImplementation(async (props) => {
        const request: ApiRequest = {
            url: props.url,
            method: props.method ?? "GET",
            data: props.data ?? undefined,
        };
        const custom = handler?.(request);
        if (custom !== undefined) return custom;
        if (request.method === "GET") return { success: true, data: [] };
        return { success: true, data: { message: "saved" } };
    });
}

/** Every request the form made, oldest first. */
export function apiRequests(method?: string): ApiRequest[] {
    return fetchMock()
        .mock.calls.map(([props]) => ({
            url: props.url,
            method: props.method ?? "GET",
            data: props.data ?? undefined,
        }))
        .filter((request) => !method || request.method === method);
}

/** The write requests (POST, PUT, PATCH, DELETE). */
export function writeRequests(): ApiRequest[] {
    return apiRequests().filter((request) => request.method !== "GET");
}

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, retryDelay: 0 },
            mutations: { retry: false },
        },
    });
}

export function renderWithClient(ui: ReactElement, client = createTestQueryClient()) {
    const result = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
    return {
        ...result,
        client,
        rerenderWithClient: (next: ReactElement) =>
            result.rerender(<QueryClientProvider client={client}>{next}</QueryClientProvider>),
    };
}

/** The element whose id is the field name (the contract the e2e tests rely on). */
export function fieldById(name: string): HTMLElement | null {
    return document.getElementById(name);
}

export function inputById(name: string): HTMLInputElement {
    const element = fieldById(name);
    if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) {
        throw new Error(`No input with id "${name}"`);
    }
    return element as HTMLInputElement;
}

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

/** Browser APIs that jsdom lacks and Radix / react-select need. Call in beforeEach. */
export function stubBrowserApis() {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.hasPointerCapture = vi.fn(() => false);
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
}

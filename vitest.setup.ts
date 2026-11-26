import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/*
 * useApiQuery reads through `apiGet` (the /api/proxy Route Handler). Unit tests stub the API by mocking
 * `useFetch` from `@/app/actions`, so `apiGet` hands each read to that (possibly mocked) `useFetch`.
 * Tests of `apiGet` itself use `vi.importActual`.
 */
vi.mock("@/lib/api/api-get", async () => {
    // Resolved once here so apiGet calls useFetch synchronously, as useApiQuery did before. A test that
    // does not mock `@/app/actions` cannot load the real one (next-auth needs the Next server), so its
    // reads fail like a network error instead of breaking the import.
    const actions = await import("@/app/actions").catch(() => null);
    return {
        apiGet: ({ url, version }: { url: string; version?: string }) =>
            actions
                ? actions.useFetch({ url, ...(version && { version }) })
                : Promise.resolve({ success: false, message: "Unable to process request", error: null, status: 500 }),
    };
});

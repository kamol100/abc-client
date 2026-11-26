import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/*
 * useApiQuery reads through `apiGet` (the /api/proxy Route Handler). Unit tests stub the API by mocking
 * `useFetch` from `@/app/actions`, so `apiGet` hands each read to that (possibly mocked) `useFetch`.
 * Tests of `apiGet` itself use `vi.importActual`.
 */
vi.mock("@/lib/api/api-get", async () => {
    // Resolved once here so apiGet calls useFetch synchronously, as useApiQuery did before.
    const actions = await import("@/app/actions");
    return {
        apiGet: ({ url, version }: { url: string; version?: string }) =>
            actions.useFetch({ url, ...(version && { version }) }),
    };
});

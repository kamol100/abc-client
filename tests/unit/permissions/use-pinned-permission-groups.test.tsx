import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePinnedPermissionGroups } from "@/components/permissions/use-pinned-permission-groups";

const useFetch = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({ useFetch }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: toastError } }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

function account(pins: string[]) {
  return { success: true, data: { id: "staff-1", settings: { pinned_permission_groups: pins } } };
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("usePinnedPermissionGroups", () => {
  beforeEach(() => {
    useFetch.mockReset();
    toastError.mockReset();
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads saved pins and saves a new pin at the top of the user's list»।
  it("Use pinned permission groups: reads saved pins and saves a new pin at the top of the user's list", async () => {
    useFetch.mockImplementation(async ({ url, method, data }: { url: string; method?: string; data?: { pinned_permission_groups: string[] } }) => {
      if (url === "/staff-account" && !method) return account(["clients"]);
      if (url === "/staff-account/settings" && method === "PUT") return account(data?.pinned_permission_groups ?? []);
      throw new Error(`unexpected ${method} ${url}`);
    });

    const { result } = renderHook(() => usePinnedPermissionGroups(), { wrapper });
    await waitFor(() => expect(result.current.canPin).toBe(true));
    expect(result.current.pins).toEqual(["clients"]);

    act(() => result.current.toggle("invoices"));
    expect(result.current.pins).toEqual(["invoices", "clients"]);

    await waitFor(() => expect(result.current.isSaving).toBe(false));
    expect(useFetch).toHaveBeenCalledWith({
      url: "/staff-account/settings",
      method: "PUT",
      data: { pinned_permission_groups: ["invoices", "clients"] },
    });
    expect(result.current.pins).toEqual(["invoices", "clients"]);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «rolls back the pin when saving fails»।
  it("Use pinned permission groups: rolls back the pin when saving fails", async () => {
    useFetch.mockImplementation(async ({ method }: { method?: string }) =>
      method === "PUT" ? { success: false, data: { message: "nope" } } : account(["clients"]),
    );

    const { result } = renderHook(() => usePinnedPermissionGroups(), { wrapper });
    await waitFor(() => expect(result.current.canPin).toBe(true));

    act(() => result.current.toggle("clients"));
    expect(result.current.pins).toEqual([]);

    await waitFor(() => expect(result.current.pins).toEqual(["clients"]));
    expect(toastError).toHaveBeenCalled();
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «cannot pin without a staff profile»।
  it("Use pinned permission groups: cannot pin without a staff profile", async () => {
    useFetch.mockResolvedValue({ success: false, status: 404, data: { message: "Staff profile not found" } });

    const { result } = renderHook(() => usePinnedPermissionGroups(), { wrapper });
    await waitFor(() => expect(useFetch).toHaveBeenCalled());
    expect(result.current.canPin).toBe(false);
    expect(result.current.pins).toEqual([]);
  });
});

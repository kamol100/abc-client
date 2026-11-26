import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PermissionEntityForm from "@/components/permissions/permission-entity-form";

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({ useFetch }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const viewport = vi.hoisted(() => ({ mobile: false }));
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => viewport.mobile }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
vi.mock("@/context/app-provider", () => ({
  useSetting: () => undefined,
}));

type Call = { url: string; method?: string; data?: { role_id: number; permission: string[] } };

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PermissionEntityForm entityId="u-1" userType="user" />
    </QueryClientProvider>,
  );
}

describe("PermissionEntityForm", () => {
  beforeEach(() => {
    useFetch.mockReset();
    useFetch.mockImplementation(async ({ url, method, data }: Call) => {
      if (url === "/permissions") {
        return { success: true, data: ["clients.access", "clients.create", "invoices.access"].map((name) => ({ name })) };
      }
      if (url === "/user-permissions/u-1") return { success: true, data: { role_id: 7, permissions: ["clients.access"], name: "Karim" } };
      if (url === "/staff-account") return { success: true, data: { settings: { pinned_permission_groups: [] } } };
      if (url === "/permission-add" && method === "POST") return { success: true, data: ["clients.access", ...(data?.permission ?? [])] };
      if (url === "/permission-remove" && method === "POST") return { success: true, data: [] };
      throw new Error(`unexpected ${method ?? "GET"} ${url}`);
    });
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the group panel and grants through the entity's role as before»।
  it("Permission entity form: shows the group panel and grants through the entity's role as before", async () => {
    const user = userEvent.setup();
    renderForm();

    const create = await screen.findByRole("checkbox", { name: /clients\.create/ });
    await waitFor(() => expect(create).toBeEnabled());
    expect(screen.getByRole("checkbox", { name: /clients\.access/ })).toBeChecked();
    expect(screen.getByRole("link", { name: "permission.back" })).toHaveAttribute("href", "/users");
    expect(screen.getByTitle("Karim")).toHaveTextContent("user:Karim");

    await user.click(create);
    await waitFor(() =>
      expect(useFetch).toHaveBeenCalledWith({
        url: "/permission-add",
        method: "POST",
        data: { role_id: 7, permission: ["clients.create"] },
      }),
    );

    const nav = screen.getByRole("navigation", { name: "permission.groups" });
    expect(within(nav).getAllByRole("listitem")).toHaveLength(2);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «revokes a whole group with the group checkbox»।
  it("Permission entity form: revokes a whole group with the group checkbox", async () => {
    const user = userEvent.setup();
    renderForm();

    await screen.findByRole("checkbox", { name: /clients\.create/ });
    await user.click(await screen.findByRole("checkbox", { name: /clients\.create/ }));
    await waitFor(() => expect(screen.getByRole("checkbox", { name: "clients" })).toBeChecked());

    await user.click(screen.getByRole("checkbox", { name: "clients" }));
    await waitFor(() =>
      expect(useFetch).toHaveBeenCalledWith({
        url: "/permission-remove",
        method: "POST",
        data: { role_id: 7, permission: ["clients.access", "clients.create"] },
      }),
    );
  });
});

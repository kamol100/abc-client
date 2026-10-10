import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormContext } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import FeaturePermissionEditor from "@/components/subscription/feature-permission-editor";

vi.mock("@/components/select-dropdown", () => ({
  default: ({ name, placeholder }: { name: string; placeholder?: string }) => {
    const { register } = useFormContext();
    return <input aria-label={name} placeholder={placeholder} {...register(name)} />;
  },
}));

const mutate = vi.hoisted(() => vi.fn());

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: () => ({
    data: {
      data: {
        permissions: [
          { name: "clients.index", access_type: "read" },
          { name: "clients.store", access_type: "write" },
          { name: "sub-zones.access", access_type: "read" },
        ],
      },
    },
    isSuccess: true,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
  default: () => ({
    mutate,
    isPending: false,
  }),
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("FeaturePermissionEditor", () => {
  it("places the form above the assigned permissions", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={client}>
        <FeaturePermissionEditor featureId="feature-1" />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("button", { name: "subscription.feature.permissions" }));

    const nameField = await screen.findByPlaceholderText("subscription.feature.permission_name");
    const assignedPermission = screen.getByText("Sub zones access");

    expect(
      nameField.compareDocumentPosition(assignedPermission) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("removes the clicked permission and keeps the rest", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    mutate.mockClear();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={client}>
        <FeaturePermissionEditor featureId="feature-1" />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("button", { name: "subscription.feature.permissions" }));

    const row = (await screen.findByText("Clients index")).closest("li");
    expect(row).not.toBeNull();
    await user.click(within(row as HTMLElement).getByRole("button", { name: "subscription.feature.remove" }));

    expect(mutate).toHaveBeenCalledWith({
      permissions: [
        { name: "clients.store", access_type: "write" },
        { name: "sub-zones.access", access_type: "read" },
      ],
    });
  });

  it("adds the selected permission to the feature", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    mutate.mockClear();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={client}>
        <FeaturePermissionEditor featureId="feature-1" />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("button", { name: "subscription.feature.permissions" }));
    await user.type(await screen.findByPlaceholderText("subscription.feature.permission_name"), "invoices.show");
    await user.click(screen.getByRole("button", { name: "common.add" }));

    expect(mutate).toHaveBeenCalledWith({
      permissions: [
        { name: "clients.index", access_type: "read" },
        { name: "clients.store", access_type: "write" },
        { name: "sub-zones.access", access_type: "read" },
        { name: "invoices.show", access_type: "read" },
      ],
    });
  });
});

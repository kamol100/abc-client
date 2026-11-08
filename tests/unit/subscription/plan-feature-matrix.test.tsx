import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PlanFeatureMatrix from "@/components/subscription/plan-feature-matrix";

const saveMutate = vi.hoisted(() => vi.fn());
const impactResult = vi.hoisted(() => ({
  removed: [] as Array<{ id: string; name: string; companies: number; staff: number; resellers: number }>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      if (key === "subscription.plan.inspector.remove_feature" && values) {
        return `${key} ${values.name} ${values.companies} ${values.staff} ${values.resellers}`;
      }
      return key;
    },
  }),
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: () => ({
    data: {
      data: {
        data: [
          {
            id: "feature-1",
            key: "clients",
            name: "Clients",
            description: "Clients, packages, and zones",
            permissions: [
              { name: "clients.show", access_type: "read" },
              { name: "clients.index", access_type: "write" },
            ],
          },
          {
            id: "feature-2",
            key: "billing",
            name: "Billing",
            permissions: [
              { name: "invoices.show", access_type: "read" },
              { name: "invoices.store", access_type: "write" },
            ],
          },
          {
            id: "feature-3",
            key: "core",
            name: "Core",
            permissions: [
              { name: "dashboard.access", access_type: "read" },
              { name: "roles.store", access_type: "write" },
            ],
          },
        ],
      },
    },
  }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
  default: (options: { method?: string; onSuccess?: (data: unknown) => void }) => {
    if (options.method === "PUT") {
      return { mutate: saveMutate, mutateAsync: saveMutate, isPending: false };
    }
    return {
      mutate: () => options.onSuccess?.({ removed: impactResult.removed }),
      mutateAsync: async () => options.onSuccess?.({ removed: impactResult.removed }),
      isPending: false,
    };
  },
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderMatrix(initial: { id: string; expired_mode: "full" | "read_only" | "disabled" }[] = []) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <PlanFeatureMatrix planId="plan-1" initial={initial} />
    </QueryClientProvider>
  );

  return view;
}

describe("PlanFeatureMatrix", () => {
  it("shows the latest saved features when the dialog opens again", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    const user = userEvent.setup();
    const view = renderMatrix([]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    expect(screen.getByRole("checkbox", { name: "Clients" })).not.toBeChecked();
    await user.keyboard("{Escape}");

    view.rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <PlanFeatureMatrix
          planId="plan-1"
          initial={[{ id: "feature-1", expired_mode: "full" }]}
        />
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    expect(screen.getByRole("checkbox", { name: "Clients" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Billing" })).not.toBeChecked();
  });

  it("sends the feature that was toggled on", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    impactResult.removed = [];
    saveMutate.mockClear();
    const user = userEvent.setup();
    renderMatrix([{ id: "feature-1", expired_mode: "read_only" }]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    await user.click(screen.getByText("Billing"));
    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(saveMutate).toHaveBeenCalledWith({
      features: [
        { id: "feature-1", expired_mode: "read_only" },
        { id: "feature-2", expired_mode: "read_only" },
      ],
    });
  });

  it("shows which routes stay after expiry", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    const user = userEvent.setup();
    renderMatrix([{ id: "feature-1", expired_mode: "read_only" }]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));

    expect(screen.getByText("clients.show")).toBeInTheDocument();
    expect(screen.getByText("subscription.plan.inspector.kept")).toBeInTheDocument();
    expect(screen.getByText("subscription.plan.inspector.dropped")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "subscription.plan.inspector.filter_write" }));
    expect(screen.queryByText("clients.show")).not.toBeInTheDocument();
    expect(screen.getByText("clients.index")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "subscription.plan.inspector.while_active" }));
    expect(screen.getAllByText("subscription.plan.inspector.granted").length).toBeGreaterThan(0);
  });

  it("leaves Core routes off the plan when Core is not included", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    const user = userEvent.setup();
    renderMatrix([{ id: "feature-1", expired_mode: "full" }]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    const core = screen.getByRole("checkbox", { name: "Core" });
    const row = core.parentElement?.parentElement;
    if (!row) throw new Error("Core row was not rendered");
    await user.click(within(row).getByText("subscription.plan.inspector.off_plan"));

    expect(core).not.toBeChecked();
    expect(screen.getByText("dashboard.access")).toBeInTheDocument();
    expect(screen.getByText("roles.store")).toBeInTheDocument();
    expect(screen.getAllByText("subscription.plan.inspector.not_on_plan").length).toBeGreaterThan(0);
    expect(screen.queryByText("subscription.plan.inspector.kept_core_read")).not.toBeInTheDocument();
  });

  it("asks before saving when a feature is removed", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    impactResult.removed = [{ id: "feature-2", name: "Billing", companies: 2, staff: 3, resellers: 1 }];
    saveMutate.mockClear();
    const user = userEvent.setup();
    renderMatrix([
      { id: "feature-1", expired_mode: "full" },
      { id: "feature-2", expired_mode: "read_only" },
    ]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    await user.click(screen.getByRole("checkbox", { name: "Billing" }));
    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(saveMutate).not.toHaveBeenCalled();
    expect(screen.getByText("subscription.plan.inspector.remove_feature Billing 2 3 1")).toBeInTheDocument();
    expect(screen.getByText("subscription.plan.inspector.remove_restore")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "subscription.plan.inspector.remove_confirm" }));
    expect(saveMutate).toHaveBeenCalledWith({
      features: [{ id: "feature-1", expired_mode: "full" }],
    });
    impactResult.removed = [];
  });

  it("does not save when the removal warning is cancelled", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    impactResult.removed = [{ id: "feature-2", name: "Billing", companies: 2, staff: 3, resellers: 1 }];
    saveMutate.mockClear();
    const user = userEvent.setup();
    renderMatrix([
      { id: "feature-1", expired_mode: "full" },
      { id: "feature-2", expired_mode: "read_only" },
    ]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    await user.click(screen.getByRole("checkbox", { name: "Billing" }));
    await user.click(screen.getByRole("button", { name: "common.save" }));
    await user.click(screen.getByRole("button", { name: "common.cancel" }));

    expect(saveMutate).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: "Billing" })).not.toBeChecked();
    impactResult.removed = [];
  });
});

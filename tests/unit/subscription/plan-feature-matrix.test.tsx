import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PlanFeatureMatrix from "@/components/subscription/plan-feature-matrix";

const mutate = vi.hoisted(() => vi.fn());

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: () => ({
    data: {
      data: {
        data: [
          { id: "feature-1", key: "clients", name: "Clients" },
          { id: "feature-2", key: "billing", name: "Billing" },
        ],
      },
    },
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
    mutate.mockClear();
    const user = userEvent.setup();
    renderMatrix([{ id: "feature-1", expired_mode: "read_only" }]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    await user.click(screen.getByText("Billing"));
    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(mutate).toHaveBeenCalledWith({
      features: [
        { id: "feature-1", expired_mode: "read_only" },
        { id: "feature-2", expired_mode: "read_only" },
      ],
    });
  });
});

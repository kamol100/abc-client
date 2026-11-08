import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormContext } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { SelectOption } from "@/components/form-wrapper/form-builder-type";
import PlanFeatureMatrix from "@/components/subscription/plan-feature-matrix";

const saveMutate = vi.hoisted(() => vi.fn());
const permissionMutate = vi.hoisted(() => vi.fn(async () => undefined));
const catalogEditor = vi.hoisted(() => ({ allowed: false }));
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

vi.mock("@/app/actions", () => ({
  useFetch: vi.fn(),
}));

vi.mock("@/components/select-dropdown", () => ({
  default: ({
    name,
    options = [],
    isDisabled,
    label,
  }: {
    name: string;
    options?: SelectOption[];
    isDisabled?: boolean;
    label?: { labelText?: string };
  }) => {
    const { watch, setValue } = useFormContext();
    const value = watch(name);
    return (
      <select
        aria-label={label?.labelText ?? name}
        disabled={isDisabled}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => setValue(name, event.target.value, { shouldDirty: true, shouldValidate: true })}
      >
        <option value="" />
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: (options: { url?: string }) => {
    if (options.url === "permissions") {
      return {
        data: {
          data: [{ name: "clients.show" }, { name: "tickets.access" }],
        },
        isLoading: false,
        isError: false,
      };
    }
    return {
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
    isLoading: false,
    isError: false,
  };
  },
}));

vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({
    hasPermission: (name: string) => name === "features.permissions" && catalogEditor.allowed,
  }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
  default: (options: { method?: string; url?: string; onSuccess?: (data: unknown) => void }) => {
    if (options.method === "PUT" && options.url?.includes("/permissions")) {
      return { mutate: permissionMutate, mutateAsync: permissionMutate, isPending: false };
    }
    if (options.method === "PUT") {
      return { mutate: saveMutate, mutateAsync: saveMutate, isPending: false };
    }
    if (options.url?.includes("/impact")) {
      return {
        mutate: () => options.onSuccess?.({ removed: impactResult.removed }),
        mutateAsync: async () => options.onSuccess?.({ removed: impactResult.removed }),
        isPending: false,
      };
    }
    return { mutate: permissionMutate, mutateAsync: permissionMutate, isPending: false };
  },
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderMatrix(
  initial: { id: string; expired_mode: "full" | "read_only" | "disabled" }[] = [],
  readOnly = false,
) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <QueryClientProvider client={client}>
      <PlanFeatureMatrix planId="plan-1" initial={initial} readOnly={readOnly} />
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

  it("moves and removes a permission when the catalog can be edited", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    catalogEditor.allowed = true;
    permissionMutate.mockClear();
    const user = userEvent.setup();
    renderMatrix([{ id: "feature-1", expired_mode: "read_only" }]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    const route = screen.getByText("clients.show").closest("tr");
    if (!route) throw new Error("route row was not rendered");

    await user.click(within(route).getByRole("button", { name: "subscription.plan.inspector.move_permission" }));
    await user.selectOptions(screen.getByLabelText("subscription.plan.inspector.move_target"), "feature-2");
    await user.click(screen.getByRole("button", { name: "subscription.plan.inspector.move_confirm" }));
    expect(permissionMutate).toHaveBeenCalledWith({ name: "clients.show", feature_id: "feature-2" });

    permissionMutate.mockClear();
    await user.click(within(route).getByRole("button", { name: "subscription.plan.inspector.remove_permission" }));
    await user.click(screen.getByRole("button", { name: "subscription.feature.remove" }));
    expect(permissionMutate).toHaveBeenCalledWith({ name: "clients.show" });
    catalogEditor.allowed = false;
  });

  it("shows plan features without letting them change", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    catalogEditor.allowed = true;
    const user = userEvent.setup();
    renderMatrix([{ id: "feature-1", expired_mode: "read_only" }], true);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));

    expect(screen.getByRole("checkbox", { name: "Clients" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Clients" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "subscription.plan.inspector.on_plan" })).toBeDisabled();
    expect(screen.getByLabelText("subscription.plan.inspector.expiry_rule")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "common.save" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "subscription.plan.inspector.add_permission" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "subscription.plan.inspector.move_permission" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "subscription.plan.inspector.remove_permission" })).not.toBeInTheDocument();
    expect(screen.getByText("clients.show")).toBeInTheDocument();
    catalogEditor.allowed = false;
  });

  it("adds an unassigned permission to the selected feature", async () => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    catalogEditor.allowed = true;
    permissionMutate.mockClear();
    const user = userEvent.setup();
    renderMatrix([{ id: "feature-1", expired_mode: "read_only" }]);

    await user.click(screen.getByRole("button", { name: "subscription.plan.features" }));
    await user.click(screen.getByRole("button", { name: "subscription.plan.inspector.add_permission" }));

    const save = screen.getByRole("button", { name: "subscription.plan.inspector.add_permission_save" });
    expect(save).toBeDisabled();
    expect(screen.getByLabelText("subscription.plan.inspector.add_permission_feature")).toHaveValue("feature-1");
    expect(screen.getByLabelText("subscription.plan.inspector.add_permission_permission")).not.toHaveTextContent("clients.show");

    await user.selectOptions(screen.getByLabelText("subscription.plan.inspector.add_permission_permission"), "tickets.access");
    expect(save).toBeEnabled();
    await user.click(save);

    expect(permissionMutate).toHaveBeenCalledWith({
      permissions: [
        { name: "clients.show", access_type: "read" },
        { name: "clients.index", access_type: "write" },
        { name: "tickets.access", access_type: "read" },
      ],
    });
    catalogEditor.allowed = false;
  });
});

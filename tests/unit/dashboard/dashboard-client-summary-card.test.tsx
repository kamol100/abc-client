import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardClientSummaryCard from "@/components/dashboard/items/DashboardClientSummaryCard";
import type { DashboardClientCount } from "@/components/dashboard/dashboard-type";

const permissionState = vi.hoisted(() => ({ allowClients: true }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({
    hasPermission: (name: string) => name === "clients.access" && permissionState.allowClients,
  }),
}));

const stats: DashboardClientCount = {
  total_clients: 12,
  active_clients: 9,
  inactive_clients: 3,
  new_clients_this_month: 4,
  new_clients: 0,
};

describe("DashboardClientSummaryCard", () => {
  it("links a positive new-client count to this month's clients", () => {
    permissionState.allowClients = true;

    render(
      <DashboardClientSummaryCard
        data={stats}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    const link = screen.getByRole("link", { name: "dashboard.metrics.view_new_clients" });
    expect(link).toHaveAttribute("href", "/clients?created_at=this_month");
    expect(screen.getByText("dashboard.metrics.active:")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "9" })).not.toBeInTheDocument();
  });

  it("leaves a zero new-client count as plain text", () => {
    permissionState.allowClients = true;

    render(
      <DashboardClientSummaryCard
        data={{ ...stats, new_clients_this_month: 0 }}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not link the count when the user cannot open clients", () => {
    permissionState.allowClients = false;

    render(
      <DashboardClientSummaryCard
        data={stats}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

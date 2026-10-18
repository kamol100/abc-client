import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardResellerSummaryCard from "@/components/dashboard/items/DashboardResellerSummaryCard";
import { DashboardResellerCountSchema } from "@/components/dashboard/dashboard-type";
import type { DashboardResellerCount } from "@/components/dashboard/dashboard-type";

const permissionState = vi.hoisted(() => ({ allowReport: true }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({
    hasPermission: (name: string) => name === "resellers.clients.report" && permissionState.allowReport,
  }),
}));

const stats: DashboardResellerCount = {
  total_resellers: 3,
  total_reseller_clients: 60,
  active_resellers: 2,
  inactive_resellers: 1,
  active_clients: 55,
  inactive_clients: 5,
  new_resellers_this_month: 10,
  new_clients_this_month: 7,
};

describe("DashboardResellerSummaryCard", () => {
  it("parses the reseller dashboard payload", () => {
    const parsed = DashboardResellerCountSchema.parse({
      total_resellers: "3",
      total_reseller_clients: "60",
      active_resellers: "2",
      inactive_resellers: "1",
      active_clients: "55",
      inactive_clients: "5",
      new_resellers_this_month: "10",
      new_clients_this_month: "7",
    });

    expect(parsed).toMatchObject(stats);
  });

  it("links a positive new-client count to this month's reseller clients", () => {
    permissionState.allowReport = true;

    render(
      <DashboardResellerSummaryCard
        data={stats}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    const link = screen.getByRole("link", { name: "dashboard.metrics.view_new_clients" });
    expect(link).toHaveAttribute("href", "/reports/reseller-clients?created_at=this_month");
    expect(screen.queryByRole("link", { name: "55" })).not.toBeInTheDocument();
  });

  it("leaves a zero new-client count as plain text", () => {
    permissionState.allowReport = true;

    render(
      <DashboardResellerSummaryCard
        data={{ ...stats, new_clients_this_month: 0 }}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not link the count when the user cannot open the reseller client report", () => {
    permissionState.allowReport = false;

    render(
      <DashboardResellerSummaryCard
        data={stats}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders reseller, client, and monthly counts", () => {
    permissionState.allowReport = true;

    render(
      <DashboardResellerSummaryCard
        data={stats}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(document.body).toHaveTextContent("dashboard.cards.total_resellers");
    expect(document.body).toHaveTextContent("dashboard.metrics.client");
    expect(screen.getByText("dashboard.metrics.active:")).toBeInTheDocument();
    expect(screen.getByText("dashboard.metrics.inactive:")).toBeInTheDocument();
    expect(screen.getByText("dashboard.metrics.new_client:")).toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll(".sr-only"), (node) => node.textContent),
    ).toEqual(["3", "60", "55", "5", "7"]);
  });

  it("shows the shared loading skeleton", () => {
    render(
      <DashboardResellerSummaryCard
        data={stats}
        isLoading
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(screen.queryByText("dashboard.cards.total_resellers")).not.toBeInTheDocument();
    expect(screen.queryByText("55")).not.toBeInTheDocument();
  });

  it("shows the shared error state", () => {
    render(
      <DashboardResellerSummaryCard
        data={stats}
        isLoading={false}
        isRefreshing={false}
        isError
      />,
    );

    expect(screen.getByText("common.failed_to_load_data")).toBeInTheDocument();
    expect(screen.queryByText("60")).not.toBeInTheDocument();
  });
});

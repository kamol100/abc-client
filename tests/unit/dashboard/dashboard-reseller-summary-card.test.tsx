import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardResellerSummaryCard from "@/components/dashboard/items/DashboardResellerSummaryCard";
import { DashboardResellerCountSchema } from "@/components/dashboard/dashboard-type";
import type { DashboardResellerCount } from "@/components/dashboard/dashboard-type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
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
    });

    expect(parsed).toMatchObject(stats);
  });

  it("renders reseller, client, and monthly counts", () => {
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
    expect(screen.getByText("dashboard.metrics.this_month:")).toBeInTheDocument();
    expect(
      Array.from(document.querySelectorAll(".sr-only"), (node) => node.textContent),
    ).toEqual(["3", "60", "55", "5", "10"]);
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

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { hasStaffInvoiceCollection } from "@/components/dashboard/dashboard-type";
import DashboardStaffInvoiceCollectionCard from "@/components/dashboard/items/DashboardStaffInvoiceCollectionCard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

const collection = {
  staff_name: "Kamol Hasan with a very long staff name",
  today_amount: 5000,
  this_month_amount: 40000,
  last_month_amount: 50000,
};

describe("DashboardStaffInvoiceCollectionCard", () => {
  it("shows the staff name truncated and the collection totals", () => {
    render(
      <DashboardStaffInvoiceCollectionCard
        staffName={collection.staff_name}
        data={collection}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(screen.getByText("dashboard.cards.invoice_collection_by")).toBeInTheDocument();
    const name = screen.getByText(collection.staff_name);
    expect(name).toHaveClass("truncate");
    expect(name).toHaveAttribute("title", collection.staff_name);
    expect(screen.getByText("5,000/-")).toBeInTheDocument();
    expect(screen.getByText("40,000/-")).toBeInTheDocument();
    expect(screen.getByText("50,000/-")).toBeInTheDocument();
    expect(screen.getByText("dashboard.metrics.today:")).toBeInTheDocument();
    expect(screen.getByText("dashboard.metrics.this_month:")).toBeInTheDocument();
    expect(screen.getByText("dashboard.metrics.last_month:")).toBeInTheDocument();
  });

  it("shows the card only when one period has an amount", () => {
    expect(hasStaffInvoiceCollection(collection)).toBe(true);
    expect(
      hasStaffInvoiceCollection({ today_amount: 0, this_month_amount: 0, last_month_amount: 0 }),
    ).toBe(false);
    expect(
      hasStaffInvoiceCollection({ today_amount: 0, this_month_amount: 1, last_month_amount: 0 }),
    ).toBe(true);
  });
});

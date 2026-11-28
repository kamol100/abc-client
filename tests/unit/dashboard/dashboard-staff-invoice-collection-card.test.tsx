import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { hasStaffInvoiceCollection } from "@/components/dashboard/dashboard-type";
import DashboardStaffInvoiceCollectionCard from "@/components/dashboard/items/DashboardStaffInvoiceCollectionCard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

// The list needs the API; here only the period it is opened for matters.
vi.mock("@/components/dashboard/items/DashboardStaffCollectionDetails", () => ({
  default: ({ period }: { period: string }) => <div data-testid="collection-list">{period}</div>,
}));

const collection = {
  staff_name: "Kamol Hasan with a very long staff name",
  today_amount: 5000,
  this_month_amount: 40000,
  last_month_amount: 50000,
};

describe("DashboardStaffInvoiceCollectionCard", () => {
  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the staff name truncated and the collection totals»।
  it("Dashboard staff invoice collection card: shows the staff name truncated and the collection totals", () => {
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
    expect(screen.getAllByText("5,000.00/-").length).toBeGreaterThan(0);
    expect(screen.getAllByText("40,000.00/-").length).toBeGreaterThan(0);
    expect(screen.getAllByText("50,000.00/-").length).toBeGreaterThan(0);
    expect(screen.getByText("dashboard.metrics.today")).toBeInTheDocument();
    expect(screen.getByText("dashboard.metrics.this_month")).toBeInTheDocument();
    expect(screen.getByText("dashboard.metrics.last_month")).toBeInTheDocument();
  });

  // পরিমাণ শূন্যের বেশি হলে সেটি বাটন হয় এবং ক্লিক করলে ওই সময়ের কালেকশন তালিকার পপ-আপ খোলে; শূন্য পরিমাণে কোনো বাটন থাকে না কি না যাচাই করি।
  it("Dashboard staff invoice collection card: an amount above zero opens that period's collection list and a zero amount is not clickable", () => {
    render(
      <DashboardStaffInvoiceCollectionCard
        staffName={collection.staff_name}
        data={{ ...collection, today_amount: 0 }}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("40,000.00/-");
    expect(buttons[1]).toHaveTextContent("50,000.00/-");
    expect(screen.queryByTestId("collection-list")).not.toBeInTheDocument();

    fireEvent.click(buttons[1]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("collection-list")).toHaveTextContent("last_month");
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the card only when one period has an amount»।
  it("Dashboard staff invoice collection card: shows the card only when one period has an amount", () => {
    expect(hasStaffInvoiceCollection(collection)).toBe(true);
    expect(
      hasStaffInvoiceCollection({ today_amount: 0, this_month_amount: 0, last_month_amount: 0 }),
    ).toBe(false);
    expect(
      hasStaffInvoiceCollection({ today_amount: 0, this_month_amount: 1, last_month_amount: 0 }),
    ).toBe(true);
  });
});

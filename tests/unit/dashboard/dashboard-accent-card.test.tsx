import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardInvoiceSummaryCard from "@/components/dashboard/items/DashboardInvoiceSummaryCard";
import { DashboardMetricCard } from "@/components/dashboard/items/DashboardMetricCard";
import { DASHBOARD_CARD_ACCENTS } from "@/components/dashboard/dashboard-constants";
import type { DashboardInvoiceSummary } from "@/components/dashboard/dashboard-type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

const invoices: DashboardInvoiceSummary = {
  total_invoice_amount: 1200,
  this_month_invoice_amount: 800,
  last_month_invoice_amount: 400,
};

function cardOf(text: string): HTMLElement {
  const card = screen.getByText(text).closest("[data-dashboard-card]");
  if (!(card instanceof HTMLElement)) throw new Error(`no dashboard card around ${text}`);
  return card;
}

describe("dashboard card accents", () => {
  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «gives a card its theme color slot and a decorative icon»।
  it("Dashboard accent card: gives a card its theme color slot and a decorative icon", () => {
    render(<DashboardInvoiceSummaryCard data={invoices} isLoading={false} isRefreshing={false} isError={false} />);

    const card = cardOf("dashboard.cards.invoices");
    expect(card).toHaveClass("dashboard-accent-card", `dashboard-tone-${DASHBOARD_CARD_ACCENTS.invoice.tone}`);
    expect(card.querySelector(".dashboard-card-icon")).toHaveAttribute("aria-hidden", "true");
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the icon while loading, so the header does not move when data arrives»।
  it("Dashboard accent card: keeps the icon while loading, so the header does not move when data arrives", () => {
    const { container } = render(
      <DashboardInvoiceSummaryCard
        data={invoices}
        isLoading
        isRefreshing={false}
        isError={false}
        accent={DASHBOARD_CARD_ACCENTS.invoiceDues}
      />,
    );

    expect(container.querySelector("[data-dashboard-card]")).toHaveClass(`dashboard-tone-${DASHBOARD_CARD_ACCENTS.invoiceDues.tone}`);
    expect(container.querySelector(".dashboard-card-icon")).toBeInTheDocument();
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves metric cards on other screens plain when they pass no accent»।
  it("Dashboard accent card: leaves metric cards on other screens plain when they pass no accent", () => {
    const { container } = render(<DashboardMetricCard title="OLT" value="4" />);

    expect(container.querySelector("[data-dashboard-card]")).toBeNull();
    expect(container.querySelector(".dashboard-card-icon")).toBeNull();
  });
});

describe("dashboard stat card layout", () => {
  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the label, the big value and the detail rows, and sums tickets for the big number»।
  it("Dashboard accent card: shows the label, the big value and the detail rows, and sums tickets for the big number", async () => {
    const { default: DashboardSupportTicketCard } = await import("@/components/dashboard/items/DashboardSupportTicketCard");
    render(
      <DashboardSupportTicketCard
        data={{ total_open_ticket: 9, total_in_progress_ticket: 4, total_resolve_ticket: 14 }}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    const card = cardOf("dashboard.cards.support_ticket");
    expect(card).toHaveTextContent("27");
    expect(screen.getByText("dashboard.metrics.open_ticket")).toBeInTheDocument();
    expect(card.querySelector(".border-dashed")).toBeInTheDocument();
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «holds the row space while loading»।
  it("Dashboard accent card: holds the row space while loading", () => {
    const { container } = render(
      <DashboardInvoiceSummaryCard data={invoices} isLoading isRefreshing={false} isError={false} />,
    );

    expect(container.querySelectorAll(".border-dashed > div")).toHaveLength(2);
  });
});

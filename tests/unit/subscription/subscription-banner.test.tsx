import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SubscriptionBanner from "@/components/subscription/subscription-banner";
import type { SubscriptionSummary } from "@/types/app";

const subscriptionState = vi.hoisted(() => ({
  current: null as SubscriptionSummary | null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: { date?: string; features?: string }) =>
      values?.date ? `${key}:${values.date}` : values?.features ? `${key}:${values.features}` : key,
  }),
}));

vi.mock("@/context/app-provider", () => ({
  useSubscription: () => ({ subscription: subscriptionState.current, setSubscription: vi.fn() }),
}));

vi.mock("@/components/my-button", () => ({
  default: ({ title }: { title?: string }) => <button type="button">{title}</button>,
}));

describe("SubscriptionBanner", () => {
  it("stays hidden while the subscription is active", () => {
    subscriptionState.current = {
      status: "active",
      state: "active",
      plan_name: "Full",
      plan_id: "plan",
      ends_at: "2027-01-01",
      read_only_features: [],
      disabled_features: [],
    };

    const { container } = render(<SubscriptionBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the expiry notice and locked features", () => {
    subscriptionState.current = {
      status: "expired",
      state: "expired",
      plan_name: "Full",
      plan_id: "plan",
      ends_at: "2026-01-01",
      read_only_features: ["billing"],
      disabled_features: ["sms"],
    };

    render(<SubscriptionBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("subscription.banner.expired");
    expect(screen.getByRole("status")).toHaveTextContent("subscription.banner.read_only:billing");
    expect(screen.getByRole("status")).toHaveTextContent("subscription.banner.disabled:sms");
  });
});

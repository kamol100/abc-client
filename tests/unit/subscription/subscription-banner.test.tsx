import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubscriptionBanner from "@/components/subscription/subscription-banner";
import type { SubscriptionSummary } from "@/types/app";

const DISMISS_STORAGE_KEY = "subscription-banner-dismissed";

const subscriptionState = vi.hoisted(() => ({
  current: null as SubscriptionSummary | null,
}));

const profileState = vi.hoisted(() => ({
  companyId: "company-a",
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      if (!values) return key;
      const details = Object.entries(values)
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(",");
      return `${key}|${details}`;
    },
  }),
}));

vi.mock("framer-motion", () => ({
  useReducedMotion: () => false,
}));

vi.mock("@/context/app-provider", () => ({
  useSubscription: () => ({ subscription: subscriptionState.current, setSubscription: vi.fn() }),
  useProfile: () => ({
    profile: {
      id: "user",
      name: "User",
      status: 1,
      company: { uuid: profileState.companyId, name: "Company" },
    },
    setProfile: vi.fn(),
    updateProfile: vi.fn(),
  }),
}));

vi.mock("@/components/my-button", () => ({
  default: ({
    url,
    onClick,
    children,
    "aria-label": ariaLabel,
  }: {
    url?: string;
    onClick?: () => void;
    children?: ReactNode;
    "aria-label"?: string;
  }) =>
    url ? (
      <a href={url} aria-label={ariaLabel}>
        {children}
      </a>
    ) : (
      <button type="button" aria-label={ariaLabel} onClick={onClick}>
        {children}
      </button>
    ),
}));

function summary(overrides: Partial<SubscriptionSummary> = {}): SubscriptionSummary {
  return {
    status: "active",
    state: "active",
    plan_name: "Basic",
    plan_id: "plan",
    ends_at: "2026-10-09",
    grace_days: 4,
    grace_ends_at: "2026-10-13",
    days_remaining: null,
    due_amount: 0,
    today: "2026-10-10",
    read_only_features: [],
    disabled_features: [],
    ...overrides,
  };
}

describe("SubscriptionBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    subscriptionState.current = null;
    profileState.companyId = "company-a";
  });

  it("stays hidden while the subscription is active or missing", () => {
    subscriptionState.current = summary();
    const { container, rerender } = render(<SubscriptionBanner />);
    expect(container).toBeEmptyDOMElement();

    subscriptionState.current = null;
    rerender(<SubscriptionBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the grace warning with the plan, remaining days, and amount due", async () => {
    subscriptionState.current = summary({
      status: "active",
      state: "grace",
      days_remaining: 3,
      due_amount: 1000,
    });

    render(<SubscriptionBanner />);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "subscription.banner.grace|plan=Basic,days=3,amount=1,000",
    );
    expect(screen.getByRole("link", { name: "subscription.banner.view" })).toHaveAttribute(
      "href",
      "/subscription",
    );
  });

  it("uses the singular day label and a today message when no days remain", async () => {
    subscriptionState.current = summary({
      state: "grace",
      days_remaining: 1,
      due_amount: 500,
    });
    const { rerender } = render(<SubscriptionBanner />);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "subscription.banner.grace_one|plan=Basic,days=1,amount=500",
    );

    subscriptionState.current = summary({
      state: "grace",
      days_remaining: 0,
      due_amount: 500,
    });
    rerender(<SubscriptionBanner />);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "subscription.banner.grace_today|plan=Basic,days=0,amount=500",
    );
  });

  it("shows the expired warning instead of the grace warning", async () => {
    subscriptionState.current = summary({
      status: "expired",
      state: "expired",
      days_remaining: 2,
      due_amount: 1000,
      read_only_features: ["billing"],
      disabled_features: ["sms"],
    });

    render(<SubscriptionBanner />);

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("subscription.banner.expired|amount=1,000");
    expect(status).not.toHaveTextContent("subscription.banner.grace");
  });

  it("dismisses the current alert until the next calendar day and keeps the other alert", async () => {
    subscriptionState.current = summary({
      state: "grace",
      days_remaining: 3,
      due_amount: 1000,
    });

    const { rerender } = render(<SubscriptionBanner />);
    fireEvent.click(await screen.findByRole("button", { name: "subscription.banner.close" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(localStorage.getItem(DISMISS_STORAGE_KEY)).toContain("company-a:grace");

    subscriptionState.current = summary({
      status: "expired",
      state: "expired",
      due_amount: 1000,
    });
    rerender(<SubscriptionBanner />);
    expect(await screen.findByRole("status")).toHaveTextContent("subscription.banner.expired");

    fireEvent.click(screen.getByRole("button", { name: "subscription.banner.close" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    subscriptionState.current = summary({
      status: "expired",
      state: "expired",
      due_amount: 1000,
      today: "2026-10-11",
    });
    rerender(<SubscriptionBanner />);
    expect(await screen.findByRole("status")).toHaveTextContent("subscription.banner.expired");
  });

  it("keeps a dismissal scoped to the company", async () => {
    localStorage.setItem(
      DISMISS_STORAGE_KEY,
      JSON.stringify({ "company-a:expired": "2026-10-10" }),
    );
    subscriptionState.current = summary({
      status: "expired",
      state: "expired",
      due_amount: 1000,
    });

    const { container, rerender } = render(<SubscriptionBanner />);
    expect(container).toBeEmptyDOMElement();

    profileState.companyId = "company-b";
    rerender(<SubscriptionBanner />);
    expect(await screen.findByRole("status")).toHaveTextContent("subscription.banner.expired");
  });
});

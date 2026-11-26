import { describe, expect, it } from "vitest";
import { CompanySubscriptionFormSchema } from "@/components/subscription/company-subscription-type";

describe("company subscription form", () => {
  // সাবস্ক্রিপশন, প্ল্যান ও ফিচার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «serializes date fields for the update payload and keeps empty dates null»।
  it("Company subscription form: serializes date fields for the update payload and keeps empty dates null", () => {
    const parsed = CompanySubscriptionFormSchema.parse({
      company_id: "company-uuid",
      plan_id: "plan-uuid",
      status: "trialing",
      starts_at: new Date(2026, 9, 9),
      ends_at: "",
    });

    expect(parsed).toEqual({
      company_id: "company-uuid",
      plan_id: "plan-uuid",
      status: "trialing",
      trial_days: 0,
      grace_days: 0,
      starts_at: "2026-10-09",
      ends_at: null,
    });
  });

  // সাবস্ক্রিপশন, প্ল্যান ও ফিচার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «defaults a missing status to active and accepts an existing date string»।
  it("Company subscription form: defaults a missing status to active and accepts an existing date string", () => {
    const parsed = CompanySubscriptionFormSchema.parse({
      company_id: "company-uuid",
      plan_id: "plan-uuid",
      trial_days: "14",
      grace_days: 7,
      starts_at: "2026-01-15",
      ends_at: null,
    });

    expect(parsed.status).toBe("active");
    expect(parsed.trial_days).toBe(14);
    expect(parsed.grace_days).toBe(7);
    expect(parsed.starts_at).toBe("2026-01-15");
    expect(parsed.ends_at).toBeNull();
  });
});

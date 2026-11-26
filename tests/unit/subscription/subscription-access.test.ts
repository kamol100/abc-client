import { describe, expect, it } from "vitest";
import { isMenuFeatureLocked, parseApiError, subscriptionDenialCode, subscriptionErrorKey } from "@/lib/helper/helper";

describe("subscription access", () => {
  // সাবস্ক্রিপশন, প্ল্যান ও ফিচার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «locks a menu feature only after the subscription expires»।
  it("Subscription access: locks a menu feature only after the subscription expires", () => {
    expect(isMenuFeatureLocked("expired", ["support"], "support")).toBe(true);
    expect(isMenuFeatureLocked("grace", ["support"], "support")).toBe(false);
    expect(isMenuFeatureLocked("expired", ["billing"], "support")).toBe(false);
    expect(isMenuFeatureLocked("expired", ["support"])).toBe(false);
  });

  // সাবস্ক্রিপশন, প্ল্যান ও ফিচার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «maps a 402 code to a translation key and does not treat it as a logout»।
  it("Subscription access: maps a 402 code to a translation key and does not treat it as a logout", () => {
    expect(subscriptionErrorKey("subscription_expired")).toBe("subscription.expired_action");
    expect(subscriptionErrorKey("feature_not_in_plan")).toBe("subscription.feature_not_in_plan");
    expect(parseApiError({ code: "subscription_expired", message: "raw" })).toBe("subscription.expired_action");
    expect(parseApiError({ message: "Other failure" })).toBe("Other failure");
    expect(subscriptionDenialCode({ code: "feature_not_in_plan" })).toBe("feature_not_in_plan");
    expect(subscriptionDenialCode({ message: "Other failure" })).toBeNull();
  });
});

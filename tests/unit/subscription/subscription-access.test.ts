import { describe, expect, it } from "vitest";
import { isMenuFeatureLocked, parseApiError, subscriptionErrorKey } from "@/lib/helper/helper";

describe("subscription access", () => {
  it("locks a menu feature only after the subscription expires", () => {
    expect(isMenuFeatureLocked("expired", ["support"], "support")).toBe(true);
    expect(isMenuFeatureLocked("grace", ["support"], "support")).toBe(false);
    expect(isMenuFeatureLocked("expired", ["billing"], "support")).toBe(false);
    expect(isMenuFeatureLocked("expired", ["support"])).toBe(false);
  });

  it("maps a 402 code to a translation key and does not treat it as a logout", () => {
    expect(subscriptionErrorKey("subscription_expired")).toBe("subscription.expired_action");
    expect(subscriptionErrorKey("feature_not_in_plan")).toBe("subscription.feature_not_in_plan");
    expect(parseApiError({ code: "subscription_expired", message: "raw" })).toBe("subscription.expired_action");
    expect(parseApiError({ message: "Other failure" })).toBe("Other failure");
  });
});

import { describe, expect, it } from "vitest";
import { canConfirmSmsSend, smsQuoteUsesWallet, type SmsSendQuote } from "@/components/sms-sent/sms-sent-type";
import {
  isSmsGatewayActive,
  isSmsSendingSetting,
  smsSettingsLocked,
} from "@/components/sms-sent/sms-gateway-status";

const quote = (overrides: Partial<SmsSendQuote> = {}): SmsSendQuote => ({
  recipients: 1,
  total_units: 1,
  total_cost: 1,
  balance: 0,
  remaining_balance: null,
  sufficient: false,
  scheduled_at: null,
  timezone: "Asia/Dhaka",
  ...overrides,
});

describe("sms gateway billing and settings", () => {
  it("confirms a private quote without wallet balance", () => {
    const provider = quote({ billing_mode: "provider", balance: null, sufficient: true });

    expect(smsQuoteUsesWallet(provider)).toBe(false);
    expect(canConfirmSmsSend(provider, "live")).toBe(true);
    expect(canConfirmSmsSend(quote({ sufficient: false }), "live")).toBe(false);
    expect(canConfirmSmsSend(quote({ sufficient: false }), "test")).toBe(true);
  });

  it("locks sms sending settings until the gateway is active", () => {
    expect(isSmsSendingSetting("sms_after_client_create")).toBe(true);
    expect(isSmsSendingSetting("invoice_due_reminder_channel")).toBe(false);
    expect(smsSettingsLocked(undefined)).toBe(true);
    expect(smsSettingsLocked({ configured: true, provider: "private", status: "inactive", name: null, masked_send_url: null, masked_balance_url: null, rate: 0.35, billing_mode: "provider", platform_rate: null, wallet_required: false })).toBe(true);
    expect(isSmsGatewayActive({ configured: true, provider: "isptik", status: "active", name: null, masked_send_url: null, masked_balance_url: null, rate: 0.35, billing_mode: "wallet", platform_rate: 0.35, wallet_required: true })).toBe(true);
  });
});

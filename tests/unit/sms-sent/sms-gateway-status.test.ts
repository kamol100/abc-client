import { describe, expect, it } from "vitest";
import { canConfirmSmsSend, smsQuoteUsesWallet, type SmsSendQuote } from "@/components/sms-sent/sms-sent-type";
import {
  formatProviderBalance,
  hasPrivateBalanceUrl,
  isSmsGatewayActive,
  isSmsSendingSetting,
  readProviderBalance,
  smsSettingsLocked,
  type SmsGatewayStatus,
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

  it("reads a private provider balance only from a configured url and a 202 amount", () => {
    const privateGateway = {
      configured: true,
      provider: "private",
      status: "active",
      name: "Own",
      balance_url: "https://sms.example/balance",
      masked_send_url: null,
      masked_balance_url: "https://sms.example/balance",
      rate: 0.35,
      billing_mode: "provider",
      platform_rate: null,
      wallet_required: false,
    } satisfies SmsGatewayStatus;

    expect(hasPrivateBalanceUrl(privateGateway)).toBe(true);
    expect(hasPrivateBalanceUrl({ ...privateGateway, balance_url: "  " })).toBe(false);
    expect(hasPrivateBalanceUrl({ ...privateGateway, provider: "isptik", balance_url: "https://sms.example/balance" })).toBe(false);
    expect(readProviderBalance({ response_code: 202, balance: 1095.35 })).toBe(1095.35);
    expect(readProviderBalance({ response_code: "202", balance: "1095.35" })).toBe(1095.35);
    expect(readProviderBalance({ response_code: 200, balance: 10 })).toBeNull();
    expect(readProviderBalance({ response_code: 202, balance: null })).toBeNull();
    expect(formatProviderBalance(1095.35)).toBe("1,095.35");
  });
});

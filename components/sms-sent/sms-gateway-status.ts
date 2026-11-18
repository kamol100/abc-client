export const SMS_GATEWAY_PROVIDERS = ["isptik", "private"] as const;

export type SmsGatewayProvider = (typeof SMS_GATEWAY_PROVIDERS)[number];

export const SMS_SENDING_SETTING_KEYS = [
  "sms_after_client_create",
  "sms_after_client_activated",
  "sms_after_client_deactivated",
  "sms_after_payment_received",
  "sms_after_manual_invoice_generate",
  "sms_after_auto_invoice_generate_client",
  "sms_after_auto_invoice_paid_from_wallet",
  "sms_after_auto_invoice_generate_reseller",
  "sms_auto_invoice_due_reminder",
] as const;

export type SmsGatewayStatus = {
  configured: boolean;
  provider: SmsGatewayProvider | null;
  status: "active" | "inactive" | null;
  name: string | null;
  send_url?: string | null;
  balance_url?: string | null;
  masked_send_url: string | null;
  masked_balance_url: string | null;
  rate: number | null;
  billing_mode: "wallet" | "provider" | null;
  platform_rate: number | null;
  wallet_required: boolean | null;
};

export function isSmsSendingSetting(key: string): boolean {
  return (SMS_SENDING_SETTING_KEYS as readonly string[]).includes(key);
}

export function isSmsGatewayActive(status: SmsGatewayStatus | null | undefined): boolean {
  return status?.configured === true && status.status === "active";
}

/** SMS-sending settings stay locked until the account gateway is active. */
export function smsSettingsLocked(status: SmsGatewayStatus | null | undefined): boolean {
  return !isSmsGatewayActive(status);
}

export type SmsProviderBalancePayload = {
  available?: boolean;
  response_code?: number | string | null;
  balance?: number | string | null;
};

export function hasPrivateBalanceUrl(status: SmsGatewayStatus | null | undefined): boolean {
  return status?.provider === "private" && Boolean(status.balance_url?.trim());
}

/** A provider balance is usable only for response code 202 and a numeric amount. */
export function readProviderBalance(payload: SmsProviderBalancePayload | undefined): number | null {
  if (!payload) return null;
  const code = payload.response_code;
  if (code !== 202 && code !== "202") return null;
  const balance = payload.balance;
  if (typeof balance === "number" && Number.isFinite(balance)) return balance;
  if (typeof balance === "string" && /^-?\d+(\.\d+)?$/.test(balance.trim())) return Number(balance);
  return null;
}

export function formatProviderBalance(amount: number): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(amount);
}

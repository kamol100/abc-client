"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast";

const API_BASE = (process.env.NEXT_PUBLIC_API ?? "").replace(/\/$/, "");

// ── Types ──────────────────────────────────────────────────────────

type BkashCreateRequest = {
  host: string;
  id: string;
  amount: number | string;
  invoice: string;
  callback: string;
};

type BkashCreateResponseData = {
  bkashURL?: string;
  paymentID?: string;
  paymentCreateTime?: string;
  transactionStatus?: string;
  amount?: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
};

type BkashExecuteRequest = {
  paymentID: string;
  pid: string;
};

type BkashExecuteResponseData = {
  message?: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  status: number;
  data?: T;
  error?: T;
};

export const BKASH_RETURN_PATHS = {
  pay: "/pay",
  "client-dashboard": "/client/dashboard",
  "client-invoices": "/client/invoices",
} as const;

export type BkashReturnTarget = keyof typeof BKASH_RETURN_PATHS;

const BKASH_RETURN_STORAGE_KEY = "bkash-invoice-return";
const DEFAULT_CALLBACK_PATH = "/pay/bkash-callback";

export type BkashPaymentParams = {
  clientId: string;
  amount: number | string;
  invoiceTrack: string;
  callbackPath?: string;
  returnTarget?: BkashReturnTarget;
};

export function isBkashReturnTarget(
  value: string | null | undefined,
): value is BkashReturnTarget {
  return value != null && Object.prototype.hasOwnProperty.call(BKASH_RETURN_PATHS, value);
}

export function resolveBkashReturnTarget(
  queryValue: string | null | undefined,
  storedValue: string | null | undefined,
): BkashReturnTarget {
  if (isBkashReturnTarget(queryValue)) return queryValue;
  if (isBkashReturnTarget(storedValue)) return storedValue;
  return "pay";
}

export function bkashReturnTargetFromPath(pathname: string): BkashReturnTarget {
  const path = pathname.split("?")[0] ?? "";
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  if (normalized === BKASH_RETURN_PATHS["client-dashboard"]) return "client-dashboard";
  if (normalized === BKASH_RETURN_PATHS["client-invoices"]) return "client-invoices";
  return "pay";
}

export function bkashPaymentSuccessPath(target: BkashReturnTarget): string {
  return `${BKASH_RETURN_PATHS[target]}?payment=success`;
}

export function bkashReturnBackLabelKey(target: BkashReturnTarget): string {
  if (target === "client-dashboard") return "pay.bkash.back_to_dashboard";
  if (target === "client-invoices") return "pay.bkash.back_to_invoices";
  return "pay.bkash.back_to_pay";
}

function safeCallbackPath(callbackPath?: string): string {
  if (
    !callbackPath ||
    !callbackPath.startsWith("/") ||
    callbackPath.startsWith("//") ||
    callbackPath.includes("\\") ||
    callbackPath.includes("://")
  ) {
    return DEFAULT_CALLBACK_PATH;
  }
  return callbackPath;
}

export function buildBkashCallbackUrl(
  origin: string,
  clientId: string,
  returnTarget: string | null | undefined,
  callbackPath?: string,
): string {
  const url = new URL(safeCallbackPath(callbackPath), origin);
  url.searchParams.set("pid", clientId);
  url.searchParams.set("return", resolveBkashReturnTarget(returnTarget, null));
  return url.toString();
}

export function rememberBkashReturnTarget(target: BkashReturnTarget): void {
  try {
    sessionStorage.setItem(BKASH_RETURN_STORAGE_KEY, target);
  } catch {
    // The callback query still carries the allowlisted target.
  }
}

export function readBkashReturnTarget(): string | null {
  try {
    return sessionStorage.getItem(BKASH_RETURN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearBkashReturnTarget(): void {
  try {
    sessionStorage.removeItem(BKASH_RETURN_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export type BkashExecuteResult = {
  success: boolean;
  message: string;
};

// ── API helpers ────────────────────────────────────────────────────

async function bkashCreate(
  body: BkashCreateRequest,
): Promise<ApiEnvelope<BkashCreateResponseData>> {
  const response = await fetch(`${API_BASE}/api/v1/bkash/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  });
  return response.json() as Promise<ApiEnvelope<BkashCreateResponseData>>;
}

async function bkashExecute(
  body: BkashExecuteRequest,
): Promise<ApiEnvelope<BkashExecuteResponseData>> {
  const response = await fetch(`${API_BASE}/api/v1/bkash/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  });
  return response.json() as Promise<ApiEnvelope<BkashExecuteResponseData>>;
}

// ── Hook ───────────────────────────────────────────────────────────

export function useBkashPayment() {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);

  const startPayment = useCallback(
    async (params: BkashPaymentParams) => {
      setIsCreating(true);
      try {
        const host = window.location.hostname;
        const returnTarget = resolveBkashReturnTarget(params.returnTarget, null);
        rememberBkashReturnTarget(returnTarget);
        const callbackUrl = buildBkashCallbackUrl(
          window.location.origin,
          params.clientId,
          returnTarget,
          params.callbackPath,
        );

        const result = await bkashCreate({
          host,
          id: params.clientId,
          amount: params.amount,
          invoice: params.invoiceTrack,
          callback: callbackUrl,
        });

        if (result.success && result.data?.bkashURL) {
          window.location.href = result.data.bkashURL;
          return;
        }

        clearBkashReturnTarget();
        const errorMessage =
          (result.error as Record<string, string> | undefined)?.message ??
          (result.data as Record<string, string> | undefined)?.statusMessage ??
          t("pay.bkash.create_failed");
        toast({ title: errorMessage, variant: "destructive" });
      } catch {
        clearBkashReturnTarget();
        toast({ title: t("pay.bkash.create_failed"), variant: "destructive" });
      } finally {
        setIsCreating(false);
      }
    },
    [t],
  );

  return { startPayment, isCreating };
}

export async function executePayment(
  paymentID: string,
  clientId: string,
): Promise<BkashExecuteResult> {
  try {
    const result = await bkashExecute({ paymentID, pid: clientId });
    if (result.success && result.data?.message === "OK") {
      return { success: true, message: "OK" };
    }
    const errorMessage =
      (result.error as Record<string, string> | undefined)?.message ??
      result.data?.message ??
      "Payment execution failed";
    return { success: false, message: errorMessage };
  } catch {
    return { success: false, message: "Network error during payment execution" };
  }
}

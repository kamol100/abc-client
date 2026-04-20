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

export type BkashPaymentParams = {
  clientId: string;
  amount: number | string;
  invoiceTrack: string;
  callbackPath?: string;
};

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
        const callbackBase = `${window.location.origin}${params.callbackPath ?? "/pay/bkash-callback"}`;
        const callbackUrl = `${callbackBase}?pid=${encodeURIComponent(params.clientId)}`;

        const result = await bkashCreate({
          host,
          id: params.clientId,
          amount: params.amount,
          invoice: params.invoiceTrack,
          callback: callbackUrl,
        });

        if (result.success && result.data?.bkashURL) {
          toast({ title: t("pay.bkash.redirecting") });
          window.location.href = result.data.bkashURL;
          return;
        }

        const errorMessage =
          (result.error as Record<string, string> | undefined)?.message ??
          (result.data as Record<string, string> | undefined)?.statusMessage ??
          t("pay.bkash.create_failed");
        toast({ title: errorMessage, variant: "destructive" });
      } catch {
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

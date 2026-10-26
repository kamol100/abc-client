"use client";

import { useMemo } from "react";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import {
  ClientDashboardPaymentSchema,
  type ClientDashboardPayment,
} from "@/components/client-area/dashboard/client-dashboard-type";

export function useClientInvoicePayment(enabled = true) {
  const {
    data: paymentResponse,
    isLoading: isPaymentQueryLoading,
    isFetching,
    isError: isPaymentQueryError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["client-invoice-payment"],
    url: "client-invoice-payment",
    pagination: false,
    enabled,
  });

  const payment = useMemo<ClientDashboardPayment | null>(() => {
    const parsed = ClientDashboardPaymentSchema.safeParse(paymentResponse?.data);
    return parsed.success ? parsed.data : null;
  }, [paymentResponse?.data]);

  return {
    payment,
    isLoading: isPaymentQueryLoading && !payment,
    isFetching,
    isError:
      isPaymentQueryError ||
      (enabled &&
        !isPaymentQueryLoading &&
        paymentResponse !== undefined &&
        payment === null),
  };
}

"use client";

import PayInvoice from "@/components/pay/pay-invoice";
import type { ClientPaymentData } from "@/types/pay-types";
import { useRouter } from "next/navigation";

type PayInvoiceViewProps = {
  data: ClientPaymentData;
};

export default function PayInvoiceView({ data }: PayInvoiceViewProps) {
  const router = useRouter();

  return <PayInvoice data={data} onSearchAgain={() => router.push("/pay")} />;
}

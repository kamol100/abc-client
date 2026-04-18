import PayContent from "@/components/pay/pay-content";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: t("pay.title"),
};

function PayFormFallback() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="space-y-4 rounded-lg border p-6">
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<PayFormFallback />}>
      <PayContent />
    </Suspense>
  );
}

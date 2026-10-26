"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function BkashPaymentResultNotice() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  if (searchParams.get("payment") !== "success") return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden />
      {t("pay.bkash.success")}
    </div>
  );
}

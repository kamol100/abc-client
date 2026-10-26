"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

const AUTO_HIDE_MS = 15_000;

export default function BkashPaymentResultNotice() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const visible = searchParams.get("payment") === "success";
  const [hidden, setHidden] = useState(false);
  const dismissRef = useRef<() => void>(() => undefined);

  const dismiss = useCallback(() => {
    setHidden(true);
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("payment")) return;
    params.delete("payment");
    const next = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.replace(next, { scroll: false });
  }, [pathname, router, searchParams]);

  dismissRef.current = dismiss;

  useEffect(() => {
    if (!visible) setHidden(false);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => dismissRef.current(), AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible || hidden) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-md border border-green-900/30 bg-green-900/10 px-4 py-3 text-sm text-green-600"
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden />
      <p className="flex-1">{t("pay.bkash.success")}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("pay.bkash.dismiss")}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-green-900/10"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

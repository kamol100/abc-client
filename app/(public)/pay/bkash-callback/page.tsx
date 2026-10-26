"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MyButton } from "@/components/my-button";
import {
  BKASH_RETURN_PATHS,
  bkashPaymentSuccessPath,
  bkashReturnBackLabelKey,
  clearBkashReturnTarget,
  executePayment,
  readBkashReturnTarget,
  resolveBkashReturnTarget,
  type BkashExecuteResult,
  type BkashReturnTarget,
} from "@/components/bkash-payment/use-bkash-payment";

type CallbackStatus = "loading" | "failed" | "cancelled";

const paymentExecutions = new Map<string, Promise<BkashExecuteResult>>();

function executePaymentOnce(paymentID: string, clientId: string) {
  const existing = paymentExecutions.get(paymentID);
  if (existing) return existing;
  const pending = executePayment(paymentID, clientId).then((result) => {
    if (!result.success) paymentExecutions.delete(paymentID);
    return result;
  });
  paymentExecutions.set(paymentID, pending);
  return pending;
}

export default function BkashCallbackPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("");
  const returnQuery = searchParams.get("return");
  const [returnTarget, setReturnTarget] = useState<BkashReturnTarget>(() =>
    resolveBkashReturnTarget(returnQuery, null),
  );

  const paymentID = searchParams.get("paymentID");
  const bkashStatus = searchParams.get("status");
  const pid = searchParams.get("pid") ?? searchParams.get("clientId") ?? "";

  useEffect(() => {
    const target = resolveBkashReturnTarget(returnQuery, readBkashReturnTarget());
    setReturnTarget(target);

    if (bkashStatus === "cancel") {
      setStatus("cancelled");
      setMessage(t("pay.bkash.cancelled"));
      return;
    }

    if (bkashStatus === "failure" || !paymentID) {
      setStatus("failed");
      setMessage(t("pay.bkash.failed"));
      return;
    }

    let active = true;

    executePaymentOnce(paymentID, pid).then((result) => {
      if (!active) return;

      if (result.success) {
        clearBkashReturnTarget();
        window.location.replace(bkashPaymentSuccessPath(target));
        return;
      }

      setStatus("failed");
      setMessage(result.message || t("pay.bkash.failed"));
    });

    return () => {
      active = false;
    };
    // `t` is omitted so a new translation function does not execute the payment again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentID, bkashStatus, pid, returnQuery]);

  const goBack = () => {
    clearBkashReturnTarget();
    window.location.assign(BKASH_RETURN_PATHS[returnTarget]);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="size-12 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("pay.bkash.executing")}</p>
            </>
          )}

          {(status === "failed" || status === "cancelled") && (
            <>
              <XCircle className="size-12 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold">
                  {status === "cancelled"
                    ? t("pay.bkash.cancelled_title")
                    : t("pay.bkash.failed_title")}
                </h2>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
            </>
          )}

          {status !== "loading" && (
            <MyButton
              type="button"
              variant="outline"
              size="default"
              className="mt-2 w-full"
              onClick={goBack}
              icon={false}
            >
              {t(bkashReturnBackLabelKey(returnTarget))}
            </MyButton>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

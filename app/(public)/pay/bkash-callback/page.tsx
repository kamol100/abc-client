"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MyButton } from "@/components/my-button";
import { executePayment } from "@/components/bkash-payment/use-bkash-payment";

type CallbackStatus = "loading" | "success" | "failed" | "cancelled";

export default function BkashCallbackPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("");

  const paymentID = searchParams.get("paymentID");
  const bkashStatus = searchParams.get("status");
  const pid = searchParams.get("pid") ?? searchParams.get("clientId") ?? "";

  useEffect(() => {
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

    let isMounted = true;

    (async () => {
      const result = await executePayment(paymentID, pid);
      if (!isMounted) return;

      if (result.success) {
        setStatus("success");
        setMessage(t("pay.bkash.success"));
      } else {
        setStatus("failed");
        setMessage(result.message || t("pay.bkash.failed"));
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentID, bkashStatus, pid]);

  const goToPay = () => {
    window.location.href = "/pay";
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

          {status === "success" && (
            <>
              <CheckCircle2 className="size-12 text-green-500" />
              <div>
                <h2 className="text-lg font-semibold">{t("pay.bkash.success_title")}</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
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
              onClick={goToPay}
              icon={false}
            >
              {t("pay.bkash.back_to_pay")}
            </MyButton>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

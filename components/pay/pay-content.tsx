"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import InputField from "@/components/form/input-field";
import { MyButton } from "@/components/my-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { PayFormSchema, type PayFormInput } from "@/components/pay/pay-form-schema";
import PayInvoice from "@/components/pay/pay-invoice";
import type { ClientPaymentData, ClientPaymentResponse } from "@/types/pay-types";

const CAPTCHA_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CAPTCHA_LENGTH = 6;
const NOISE_LINE_COUNT = 5;
const API_BASE = (process.env.NEXT_PUBLIC_API ?? "").replace(/\/$/, "");

type CaptchaVisual = {
  code: string;
  characterRotations: number[];
  characterOffsets: number[];
  noiseLines: Array<{ top: number; left: number; width: number; rotate: number }>;
};

const INITIAL_CAPTCHA: CaptchaVisual = {
  code: "AAAAAA",
  characterRotations: [0, 0, 0, 0, 0, 0],
  characterOffsets: [0, 0, 0, 0, 0, 0],
  noiseLines: [],
};

function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCaptcha() {
  const code = Array.from({ length: CAPTCHA_LENGTH }, () =>
    CAPTCHA_CHARSET.charAt(getRandomInteger(0, CAPTCHA_CHARSET.length - 1)),
  ).join("");

  return {
    code,
    characterRotations: Array.from({ length: CAPTCHA_LENGTH }, () => getRandomInteger(-20, 20)),
    characterOffsets: Array.from({ length: CAPTCHA_LENGTH }, () => getRandomInteger(-3, 3)),
    noiseLines: Array.from({ length: NOISE_LINE_COUNT }, () => ({
      top: getRandomInteger(10, 90),
      left: getRandomInteger(0, 65),
      width: getRandomInteger(35, 75),
      rotate: getRandomInteger(-35, 35),
    })),
  } satisfies CaptchaVisual;
}

async function fetchClientPayment(phone: string): Promise<ClientPaymentData> {
  const host = window.location.hostname;
  const url = `${API_BASE}/api/v1/public/get-client?phone=${encodeURIComponent(phone)}&host=${encodeURIComponent(host)}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
  });

  if (res.status === 404 || res.status === 422) {
    throw new Error("not_found");
  }

  if (!res.ok) {
    throw new Error("error");
  }

  const json = (await res.json()) as ClientPaymentResponse;
  return json.data;
}

export default function PayContent() {
  const { t } = useTranslation();
  const [captcha, setCaptcha] = useState<CaptchaVisual>(INITIAL_CAPTCHA);
  const [isPending, setIsPending] = useState(false);
  const [clientData, setClientData] = useState<ClientPaymentData | null>(null);

  const schema = useMemo(
    () =>
      PayFormSchema.refine(
        (data) => data.captcha.trim().toUpperCase() === captcha.code,
        {
          message: "pay.captcha.errors.incorrect",
          path: ["captcha"],
        },
      ),
    [captcha.code],
  );

  const form = useForm<PayFormInput>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", captcha: "" },
    mode: "onSubmit",
  });

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    form.setValue("captcha", "");
    form.clearErrors("captcha");
  }, [form]);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleSearchAgain = useCallback(() => {
    setClientData(null);
    form.reset();
    refreshCaptcha();
  }, [form, refreshCaptcha]);

  const onSubmit = async (data: PayFormInput) => {
    setIsPending(true);
    try {
      const result = await fetchClientPayment(data.phone);
      setClientData(result);
    } catch (err) {
      const key = err instanceof Error && err.message === "not_found"
        ? "pay.result.not_found"
        : "pay.result.error";
      toast({ title: t(key), variant: "destructive" });
      refreshCaptcha();
    } finally {
      setIsPending(false);
    }
  };

  if (clientData) {
    return <PayInvoice data={clientData} onSearchAgain={handleSearchAgain} />;
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("pay.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("pay.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <InputField
                name="phone"
                type="tel"
                label={{ labelText: "pay.phone.label" }}
                placeholder="pay.phone.placeholder"
              />

              <div className="space-y-1.5">
                <div
                  aria-label={t("pay.captcha.image_alt")}
                  className="relative overflow-hidden rounded-md border bg-muted/20 px-4 py-3 select-none"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15),rgba(255,255,255,0.03),rgba(255,255,255,0.15))]" />
                  {captcha.noiseLines.map((line, index) => (
                    <span
                      key={`line-${index}`}
                      className="pointer-events-none absolute h-px bg-foreground/35"
                      style={{
                        top: `${line.top}%`,
                        left: `${line.left}%`,
                        width: `${line.width}px`,
                        transform: `rotate(${line.rotate}deg)`,
                      }}
                    />
                  ))}
                  <p className="relative flex justify-center gap-1 font-mono text-2xl font-semibold tracking-[0.2em] text-foreground/90">
                    {captcha.code.split("").map((character, index) => (
                      <span
                        key={`${character}-${index}`}
                        style={{
                          transform: `translateY(${captcha.characterOffsets[index]}px) rotate(${captcha.characterRotations[index]}deg)`,
                        }}
                        className="inline-block"
                      >
                        {character}
                      </span>
                    ))}
                  </p>
                </div>
                <InputField
                  name="captcha"
                  label={{ labelText: "pay.captcha.label" }}
                  placeholder="pay.captcha.placeholder"
                />
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  {t("pay.captcha.refresh")}
                </button>
              </div>

              <MyButton
                type="submit"
                variant="default"
                size="default"
                className="w-full"
                disabled={isPending}
              >
                {isPending && <Loader2 className="animate-spin" />}
                {t("pay.submit")}
              </MyButton>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}

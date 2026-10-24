"use client";

import InputField from "@/components/form/input-field";
import { MyButton } from "@/components/my-button";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/components/schema/password-reset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { postPublicData } from "@/lib/api/api";
import {
  EMAIL_NOT_FOUND_MESSAGE,
  FORGOT_PASSWORD_PATH,
  publicApiDataMessage,
  publicApiMessage,
  publicApiSucceeded,
  RESET_PASSWORD_PATH,
} from "@/lib/auth/password-reset";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const DEFAULT_LOGO = "/static/logo.png";

type AuthPanelProps = {
  title: string;
  companyLogoUrl?: string | null;
  companyName?: string | null;
  children: ReactNode;
  className?: string;
};

function AuthPanel({ title, companyLogoUrl, companyName, children, className }: AuthPanelProps) {
  const [logoSource, setLogoSource] = useState(companyLogoUrl ?? DEFAULT_LOGO);
  const companyLabel = companyName?.trim() ?? "";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex justify-center">
        <img
          src={logoSource}
          alt="Company logo"
          className="h-8 w-auto max-w-[160px] object-contain"
          onError={() => setLogoSource(DEFAULT_LOGO)}
        />
      </div>
      <Card className="min-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          {companyLabel ? (
            <p className="text-sm text-muted-foreground">{companyLabel}</p>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function requestHost(): string {
  return window.location.hostname;
}

async function postPasswordReset(path: string, payload: Record<string, string>): Promise<unknown> {
  return postPublicData(path, payload);
}

type PasswordResetFormProps = {
  companyLogoUrl?: string | null;
  companyName?: string | null;
  className?: string;
};

export function ForgotPasswordForm({ companyLogoUrl, companyName, className }: PasswordResetFormProps) {
  const { t } = useTranslation();
  const submitting = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    if (submitting.current) return;
    submitting.current = true;
    setIsPending(true);
    setFormError(null);

    try {
      const body = await postPasswordReset(FORGOT_PASSWORD_PATH, {
        email: values.email,
        host: requestHost(),
      });

      if (publicApiSucceeded(body)) {
        setSuccessMessage(publicApiDataMessage(body) ?? t("password_reset.forgot_success"));
        return;
      }

      const message = publicApiMessage(body, t("password_reset.errors.request_failed"));
      setFormError(message === EMAIL_NOT_FOUND_MESSAGE ? EMAIL_NOT_FOUND_MESSAGE : message);
    } catch {
      setFormError(t("password_reset.errors.request_failed"));
    } finally {
      submitting.current = false;
      setIsPending(false);
    }
  };

  return (
    <AuthPanel
      title={t("password_reset.forgot_title")}
      companyLogoUrl={companyLogoUrl}
      companyName={companyName}
      className={className}
    >
      {successMessage ? (
        <div className="grid gap-6 pb-6">
          <p role="status" className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
            <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            {successMessage}
          </p>
          <MyButton url="/admin" variant="default" size="default" className="w-full" icon={false} title="password_reset.back_to_login" />
        </div>
      ) : (
        <FormProvider {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 pb-6">
              <p className="text-sm text-muted-foreground">{t("password_reset.forgot_description")}</p>
              <InputField
                type="email"
                name="email"
                label={{ labelText: "password_reset.email.label" }}
                placeholder="password_reset.email.placeholder"
              />
              {formError ? (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              ) : null}
              <MyButton type="submit" variant="default" size="default" className="w-full" loading={isPending} icon={false}>
                {t("password_reset.submit_forgot")}
              </MyButton>
              <Link href="/admin" className="text-center text-sm underline-offset-4 hover:underline">
                {t("password_reset.back_to_login")}
              </Link>
            </div>
          </form>
        </FormProvider>
      )}
    </AuthPanel>
  );
}

export function ResetPasswordForm({ companyLogoUrl, companyName, className }: PasswordResetFormProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";
  const linkReady = token !== "" && ForgotPasswordSchema.shape.email.safeParse(email).success;
  const submitting = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    if (submitting.current || !linkReady) return;
    submitting.current = true;
    setIsPending(true);
    setFormError(null);

    try {
      const body = await postPasswordReset(RESET_PASSWORD_PATH, {
        token,
        email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        host: requestHost(),
      });

      if (publicApiSucceeded(body)) {
        setSuccessMessage(publicApiDataMessage(body) ?? t("password_reset.reset_success"));
        return;
      }

      setFormError(publicApiMessage(body, t("password_reset.errors.invalid_token")));
    } catch {
      setFormError(t("password_reset.errors.request_failed"));
    } finally {
      submitting.current = false;
      setIsPending(false);
    }
  };

  return (
    <AuthPanel
      title={t("password_reset.reset_title")}
      companyLogoUrl={companyLogoUrl}
      companyName={companyName}
      className={className}
    >
      {successMessage ? (
        <div className="grid gap-6 pb-6">
          <p role="status" className="text-sm text-muted-foreground">
            {successMessage}
          </p>
          <MyButton url="/admin" variant="default" size="default" className="w-full" icon={false} title="password_reset.back_to_login" />
        </div>
      ) : !linkReady ? (
        <div className="grid gap-6 pb-6">
          <p role="alert" className="text-sm text-destructive">
            {t("password_reset.errors.incomplete_link")}
          </p>
          <Link href="/forgot-password" className="text-center text-sm underline-offset-4 hover:underline">
            {t("password_reset.request_again")}
          </Link>
        </div>
      ) : (
        <FormProvider {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 pb-6">
              <p className="text-sm text-muted-foreground">{t("password_reset.reset_description")}</p>
              <InputField
                type="password"
                name="password"
                label={{ labelText: "password_reset.password.label" }}
                placeholder="password_reset.password.placeholder"
              />
              <InputField
                type="password"
                name="password_confirmation"
                label={{ labelText: "password_reset.password_confirmation.label" }}
                placeholder="password_reset.password_confirmation.placeholder"
              />
              {formError ? (
                <div className="grid gap-2">
                  <p role="alert" className="text-sm text-destructive">
                    {formError}
                  </p>
                  <Link href="/forgot-password" className="text-sm underline-offset-4 hover:underline">
                    {t("password_reset.request_again")}
                  </Link>
                </div>
              ) : null}
              <MyButton type="submit" variant="default" size="default" className="w-full" loading={isPending} icon={false}>
                {t("password_reset.submit_reset")}
              </MyButton>
              <Link href="/admin" className="text-center text-sm underline-offset-4 hover:underline">
                {t("password_reset.back_to_login")}
              </Link>
            </div>
          </form>
        </FormProvider>
      )}
    </AuthPanel>
  );
}

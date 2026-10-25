"use client";

import { MyButton } from "@/components/my-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ClientLoginSchema, type ClientLogin } from "@/components/schema/client-login";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import InputField from "@/components/form/input-field";
import { CLIENT_DASHBOARD_PATH, CLIENT_LOGIN_PATH } from "@/lib/auth/routes";

const CLIENT_AUTH_API = "/auth/client";
const DEFAULT_LOGO = "/static/logo.png";
const HOME_PATH = "/home";

type ClientLoginFormProps = React.ComponentPropsWithoutRef<"div"> & {
  companyLogoUrl?: string | null;
  companyName?: string | null;
};

export function ClientLoginForm({
  className,
  companyLogoUrl,
  companyName,
  ...props
}: ClientLoginFormProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || CLIENT_DASHBOARD_PATH;
  const authError = searchParams.get("error");

  const [host, setHost] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [handledAuthError, setHandledAuthError] = useState<string | null>(null);
  const [logoSource, setLogoSource] = useState<string>(companyLogoUrl ?? DEFAULT_LOGO);

  const form = useForm<ClientLogin>({
    resolver: zodResolver(ClientLoginSchema),
    defaultValues: {
      api: CLIENT_AUTH_API,
      phone: "",
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setHost(window?.location?.hostname ?? "");
  }, [mounted]);

  useEffect(() => {
    setLogoSource(companyLogoUrl ?? DEFAULT_LOGO);
  }, [companyLogoUrl]);

  useEffect(() => {
    if (!authError || handledAuthError === authError) return;
    const message =
      authError === "CredentialsSignin"
        ? t("client_login.errors.invalid_credentials")
        : t("client_login.errors.something_went_wrong");
    toast({ title: message, variant: "destructive" });
    setHandledAuthError(authError);
  }, [authError, handledAuthError, t]);

  const onSubmit = async (data: ClientLogin) => {
    setIsPending(true);
    try {
      const safeRedirect = callbackUrl.startsWith("/client/") ? callbackUrl : CLIENT_DASHBOARD_PATH;
      console.log(data, host);
      const result = await signIn("credentials", {
        username: data.phone,
        password: data.password,
        host,
        redirect: false,
        redirectTo: safeRedirect,
        api: data.api,
      });

      console.log(result);

      if (result?.error) {
        const loginUrl = new URL(CLIENT_LOGIN_PATH, window.location.origin);
        loginUrl.searchParams.set("error", result.error);
        if (callbackUrl) loginUrl.searchParams.set("callbackUrl", callbackUrl);
        window.location.href = loginUrl.toString();
        return;
      }

      if (result?.ok) {
        window.location.href = safeRedirect;
        return;
      }

      toast({ title: t("client_login.errors.something_went_wrong"), variant: "destructive" });
    } catch {
      toast({ title: t("client_login.errors.something_went_wrong"), variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  const dividerLabel = companyName?.trim() || t("login.continue_with_credentials");

  if (!mounted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex justify-center">
          <img
            src={logoSource}
            alt="Company logo"
            className="h-8 w-auto max-w-[160px] object-contain"
            onError={() => setLogoSource(DEFAULT_LOGO)}
          />
        </div>
        <Card className="min-w-[350px]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">&nbsp;</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 pb-6">
              <div className="grid gap-6">
                <div className="h-10 rounded-md bg-muted animate-pulse" />
                <div className="h-10 rounded-md bg-muted animate-pulse" />
                <div className="h-10 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
          <CardTitle className="text-xl">{t("client_login.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6 pb-6">
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    {dividerLabel}
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <InputField
                      name="phone"
                      label={{ labelText: "client_login.phone.label" }}
                      placeholder="client_login.phone.placeholder"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">{t("client_login.password.label")}</Label>
                    <InputField
                      type="password"
                      name="password"
                      placeholder="client_login.password.placeholder"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <MyButton type="submit" variant="default" size="default" className="w-full">
                      {isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
                      {t("client_login.submit")}
                    </MyButton>
                    <MyButton
                      url={HOME_PATH}
                      variant="outline"
                      size="default"
                      className="w-full"
                      icon={false}
                    >
                      <ArrowLeft />
                      {t("client_login.back")}
                    </MyButton>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientLoginForm;

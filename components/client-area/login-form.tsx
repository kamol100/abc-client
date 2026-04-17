"use client";

import { MyButton } from "@/components/my-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ClientLoginSchema, type ClientLogin } from "@/components/schema/client-login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import InputField from "@/components/form/input-field";

const CLIENT_LOGIN_ROUTE = "/client/login";
const CLIENT_DASHBOARD_ROUTE = "/client/dashboard";
const CLIENT_AUTH_API = "/auth/client";

export function ClientLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || CLIENT_DASHBOARD_ROUTE;
  const authError = searchParams.get("error");

  const [host, setHost] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [handledAuthError, setHandledAuthError] = useState<string | null>(null);

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
      const safeRedirect = callbackUrl.startsWith("/client/") ? callbackUrl : CLIENT_DASHBOARD_ROUTE;
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
        const loginUrl = new URL(CLIENT_LOGIN_ROUTE, window.location.origin);
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

  if (!mounted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
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
                    {t("login.continue_with_credentials")}
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
                  <MyButton type="submit" variant="default" size="default" className="w-full">
                    {isPending && <Loader2 className="animate-spin" />}
                    {t("client_login.submit")}
                  </MyButton>
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

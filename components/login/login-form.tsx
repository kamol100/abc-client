"use client";
import { MyButton } from "@/components/my-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import InputField from "../form/input-field";
import Logo from "../logo";
import { Login, LoginSchema } from "../schema/login";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const authError = searchParams.get("error");
  const [host, setHost] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [handledAuthError, setHandledAuthError] = useState<string | null>(null);
  const loginFrom = useForm<Login>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const domain = window?.location?.hostname;
    setHost(domain ?? "");
  }, [mounted]);

  useEffect(() => {
    if (!authError || handledAuthError === authError) return;
    const message =
      authError === "CredentialsSignin"
        ? "login.errors.invalid_credentials"
        : "login.errors.something_went_wrong";
    toast({
      title: t(message),
      variant: "destructive",
    });
    setHandledAuthError(authError);
  }, [authError, handledAuthError, t]);

  const onSubmit = async (data: Login) => {
    setIsPending(true);
    try {
      const redirectTo =
        callbackUrl.startsWith("/") &&
          !callbackUrl.startsWith("/admin") &&
          !callbackUrl.startsWith("/login")
          ? callbackUrl
          : "/dashboard";
      const result = await signIn("credentials", {
        ...data,
        host,
        redirect: false,
        redirectTo,
      });

      if (result?.error) {
        const loginUrl = new URL("/admin", window.location.origin);
        loginUrl.searchParams.set("error", result.error);
        if (callbackUrl) {
          loginUrl.searchParams.set("callbackUrl", callbackUrl);
        }
        window.location.href = loginUrl.toString();
        return;
      }

      if (result?.ok) {
        window.location.href = redirectTo;
        return;
      }

      toast({
        title: t("login.errors.something_went_wrong"),
        variant: "destructive",
      });
    } catch {
      toast({
        title: t("login.errors.something_went_wrong"),
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };
  const onError = (data: any) => {
    console.log(data);
  };

  if (!mounted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex justify-center">
        </div>
        <Card className="min-w-[350px]">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">&nbsp;</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 pb-6">
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  &nbsp;
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <div className="h-10 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="grid gap-2">
                  <div className="h-10 rounded-md bg-muted animate-pulse" />
                </div>
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
        {/* <Logo /> */}
      </div>
      <Card className="min-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("login.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...loginFrom}>
            <form onSubmit={loginFrom?.handleSubmit(onSubmit, onError)}>
              <div className="grid gap-6 pb-6">
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    {t("login.continue_with_credentials")}
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <InputField
                      name="username"
                      label={{ labelText: "login.username.label" }}
                      placeholder="login.username.placeholder"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">{t("login.password.label")}</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        {t("login.forgot_password")}
                      </a>
                    </div>
                    <InputField
                      type="password"
                      name="password"
                      placeholder="login.password.placeholder"
                    />
                  </div>
                  <MyButton type="submit" variant="default" size="default" className="w-full">
                    {isPending && <Loader2 className="animate-spin" />}
                    {t("login.submit")}
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

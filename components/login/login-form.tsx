"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { authenticate } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import InputField from "../form/input-field";
import { Login, LoginSchema } from "../schema/login";
import { useEffect, useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [host, setHost] = useState("");
  const loginFrom = useForm<Login>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
  });
  useEffect(() => {
    const domain = window?.location?.hostname;
    setHost(domain);
  });
  const { mutate: login, isPending } = useMutation({

    mutationFn: async (data: any) => {
      const result: any = await authenticate(
        Object.assign(data, { host })
      );
      if (result?.error) {
        toast({
          title: result?.message,
          variant: "destructive",
        });
      }
    },
    onSuccess: (data: any) => {
      //
    },
    onError: (error: any) => {
      //
    },
  });
  const onSubmit = async (data: any) => {
    console.log(data);
    login(data);
  };
  const onError = (data: any) => {
    console.log(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...loginFrom}>
            <form onSubmit={loginFrom?.handleSubmit(onSubmit, onError)}>
              <div className="grid gap-6">
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    continue with test
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <InputField
                      name="username"
                      label={{ labelText: "Username" }}
                      placeholder="Username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <InputField
                      type="password"
                      name="password"
                      placeholder="Password"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {isPending && <Loader2 className="animate-spin" />}
                    Login
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="#" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </div>
              <input type="hidden" name="redirectTo" value={callbackUrl} />
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}

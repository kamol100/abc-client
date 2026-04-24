"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import MyButton from "@/components/my-button";
import { buildDemoRequestSchema, type DemoRequestFormValues } from "@/lib/validations/demo-request-schema";
import { cn } from "@/lib/utils";
import { postPublicData } from "@/lib/api/api";

function I18nFormMessage({ className }: { className?: string }) {
  const { error, formMessageId } = useFormField();
  const { t } = useTranslation();
  if (!error?.message) return null;
  return (
    <p
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
    >
      {t(String(error.message))}
    </p>
  );
}

type DemoRequestApi = {
  success: boolean;
  data?: { message?: string; id?: string };
};

const defaultValues: DemoRequestFormValues = {
  full_name: "",
  isp_name: "",
  email: "",
  website: "",
  phone: "",
  user_count: "",
  whatsapp: "",
  office_address: "",
  terms_accepted: false,
};

export default function DemoRequestForm() {
  const { t, i18n } = useTranslation();
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const schema = useMemo(() => buildDemoRequestSchema(t), [t, i18n.language]);

  const form = useForm<DemoRequestFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: DemoRequestFormValues) => {
      const res = (await postPublicData("/demo-request", {
        ...payload,
      })) as DemoRequestApi;
      if (res?.success) return res;
      throw new Error("demo_request.api.errors.validation");
    },
    onSuccess: () => {
      setSubmitSucceeded(true);
    },
    onError: (e: unknown) => {
      const key = e instanceof Error ? e.message : "common.request_failed";
      toast.error(
        t(
          key.startsWith("demo_request.") || key === "common.request_failed" ? key : "common.request_failed"
        )
      );
    },
  });

  const onSubmit = (values: DemoRequestFormValues) => mutate(values);

  if (submitSucceeded) {
    return (
      <Card className="mx-auto w-full max-w-2xl border bg-background">
        <CardContent className="px-6 py-12 sm:px-10 sm:py-14">
          <div className="mx-auto flex max-w-lg flex-col items-center gap-8 text-center">
            <CheckCircle2
              className="size-20 text-primary sm:size-24"
              strokeWidth={1.25}
              aria-hidden
            />
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("demo_request.success.title")}
              </h2>
              <p className="text-base text-muted-foreground sm:text-lg">
                {t("demo_request.success.message")}
              </p>
            </div>
            <MyButton
              url="/home"
              variant="default"
              size="default"
              className="w-full min-w-[12rem] sm:w-auto"
              icon={false}
              title="demo_request.success.back"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border bg-background">
      <CardContent className="pt-6 sm:pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <fieldset disabled={isPending} className="min-w-0 space-y-6 border-0 p-0">
            <div className="grid gap-4 sm:grid-cols-1">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("demo_request.fields.full_name.label")}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder={t("demo_request.fields.full_name.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <I18nFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isp_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("demo_request.fields.isp_name.label")}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="organization"
                        placeholder={t("demo_request.fields.isp_name.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <I18nFormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("demo_request.fields.email.label")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder={t("demo_request.fields.email.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <I18nFormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("demo_request.fields.website.label")}
                        <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                          ({t("demo_request.optional")})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          inputMode="url"
                          autoComplete="url"
                          placeholder={t("demo_request.fields.website.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <I18nFormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("demo_request.fields.phone.label")}</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          autoComplete="tel"
                          placeholder={t("demo_request.fields.phone.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <I18nFormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="user_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("demo_request.fields.user_count.label")}
                        <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                          ({t("demo_request.optional")})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={t("demo_request.fields.user_count.placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <I18nFormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("demo_request.fields.whatsapp.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        autoComplete="tel"
                        placeholder={t("demo_request.fields.whatsapp.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <I18nFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="office_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("demo_request.fields.office_address.label")}
                      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                        ({t("demo_request.optional")})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        autoComplete="street-address"
                        placeholder={t("demo_request.fields.office_address.placeholder")}
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <I18nFormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms_accepted"
                render={({ field }) => (
                  <FormItem className="space-y-2 rounded-md border p-4">
                    <div className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(c) => field.onChange(c === true)}
                          className="mt-0.5"
                          aria-label={t("demo_request.fields.terms.aria")}
                        />
                      </FormControl>
                      <p className="text-sm font-normal leading-snug text-foreground">
                        <span>{t("demo_request.fields.terms.lead")} </span>
                        <Link
                          href="/home"
                          className="text-primary underline"
                        >
                          {t("demo_request.fields.terms.terms_link")}
                        </Link>
                        <span> {t("demo_request.fields.terms.conjunction")} </span>
                        <Link
                          href="/home"
                          className="text-primary underline"
                        >
                          {t("demo_request.fields.terms.privacy_link")}
                        </Link>
                        .
                      </p>
                    </div>
                    <I18nFormMessage />
                  </FormItem>
                )}
              />
            </div>

            <MyButton
              type="submit"
              className="w-full sm:w-auto"
              size="default"
              variant="default"
              icon={false}
              loading={isPending}
            >
              {t("demo_request.form.submit")}
            </MyButton>
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

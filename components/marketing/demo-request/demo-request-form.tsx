"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Form, FormControl, FormField, FormItem, useFormField } from "@/components/ui/form";
import { buildDemoRequestSchema, type DemoRequestFormValues } from "@/lib/validations/demo-request-schema";
import { postPublicData } from "@/lib/api/api";

// The helper line under each field: always present so the layout does not jump, filled only with an error.
function FieldMessage() {
  const { error, formMessageId } = useFormField();
  const { t } = useTranslation();
  return (
    <p id={formMessageId} className="mkt-demo-msg">
      {error?.message ? (
        <>
          <AlertCircle aria-hidden />
          {t(String(error.message))}
        </>
      ) : null}
    </p>
  );
}

function FieldLabel({ children, optional }: { children: ReactNode; optional?: boolean }) {
  const { formItemId } = useFormField();
  const { t } = useTranslation();
  return (
    <label htmlFor={formItemId} className="mkt-demo-label">
      {children}
      {optional && <span className="mkt-demo-label__opt">({t("demo_request.optional")})</span>}
    </label>
  );
}

type TextName = Exclude<keyof DemoRequestFormValues, "terms_accepted">;

type TextFieldProps = {
  name: TextName;
  optional?: boolean;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "email" | "url" | "tel";
  inputMode?: "url" | "numeric";
  autoComplete?: string;
  placeholder?: string;
};

function TextField({ name, optional, required, multiline, type = "text", inputMode, autoComplete, placeholder }: TextFieldProps) {
  const { control } = useFormContext<DemoRequestFormValues>();
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mkt-demo-field">
          <FieldLabel optional={optional}>{t(`demo_request.fields.${name}.label`)}</FieldLabel>
          <FormControl>
            {multiline ? (
              <textarea
                rows={4}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className="mkt-demo-input"
                aria-required={required || undefined}
                {...field}
                value={field.value ?? ""}
              />
            ) : (
              <input
                type={type}
                inputMode={inputMode}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className="mkt-demo-input"
                aria-required={required || undefined}
                {...field}
                value={field.value ?? ""}
              />
            )}
          </FormControl>
          <FieldMessage />
        </FormItem>
      )}
    />
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
  const doneRef = useRef<HTMLHeadingElement>(null);
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

  // Move focus to the confirmation once the API has answered, so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (submitSucceeded) doneRef.current?.focus();
  }, [submitSucceeded]);

  const onSubmit = (values: DemoRequestFormValues) => mutate(values);

  if (submitSucceeded) {
    return (
      <div className="mkt-demo-done">
        <CheckCircle2 className="mkt-demo-done__icon" strokeWidth={1.5} aria-hidden />
        <h2 ref={doneRef} tabIndex={-1}>
          {t("demo_request.success.title")}
        </h2>
        <p className="lead">{t("demo_request.success.message")}</p>
        <Link href="/home" className="mkt-btn">
          {t("demo_request.success.back")}
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mkt-demo-form">
        <fieldset disabled={isPending} className="mkt-demo-fieldset">
          <TextField name="full_name" required autoComplete="name" />
          <TextField name="isp_name" required autoComplete="organization" />

          <div className="mkt-demo-pair">
            <TextField
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("demo_request.fields.email.placeholder")}
            />
            <TextField
              name="website"
              optional
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.isptik.com"
            />
          </div>

          <div className="mkt-demo-pair">
            <TextField
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              placeholder={t("demo_request.fields.phone.placeholder")}
            />
            <TextField
              name="user_count"
              optional
              inputMode="numeric"
              placeholder={t("demo_request.fields.user_count.placeholder")}
            />
          </div>

          <TextField
            name="whatsapp"
            required
            type="tel"
            autoComplete="tel"
            placeholder={t("demo_request.fields.whatsapp.placeholder")}
          />

          <TextField
            name="office_address"
            optional
            multiline
            autoComplete="street-address"
            placeholder={t("demo_request.fields.office_address.placeholder")}
          />

          <FormField
            control={form.control}
            name="terms_accepted"
            render={({ field }) => (
              <FormItem className="mkt-demo-terms">
                <div className="mkt-demo-terms__row">
                  <label className="mkt-demo-hit">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="mkt-demo-check"
                        name={field.name}
                        ref={field.ref}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        aria-required="true"
                        aria-label={t("demo_request.fields.terms.aria")}
                      />
                    </FormControl>
                  </label>
                  <p className="mkt-demo-terms__text">
                    <span>{t("demo_request.fields.terms.lead")} </span>
                    {/* Both links point to /home until legal pages exist. */}
                    <Link href="/home">{t("demo_request.fields.terms.terms_link")}</Link>
                    <span> {t("demo_request.fields.terms.conjunction")} </span>
                    <Link href="/home">{t("demo_request.fields.terms.privacy_link")}</Link>.
                  </p>
                </div>
                <FieldMessage />
              </FormItem>
            )}
          />

          <div className="mkt-demo-actions">
            <button type="submit" className="mkt-btn mkt-demo-submit" aria-busy={isPending}>
              {t("demo_request.form.submit")}
              <Loader2 className="mkt-demo-spin" aria-hidden />
            </button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}

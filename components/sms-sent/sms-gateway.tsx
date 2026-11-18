"use client";

import InputField from "@/components/form/input-field";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import {
  isSmsGatewayActive,
  type SmsGatewayProvider,
  type SmsGatewayStatus,
} from "@/components/sms-sent/sms-gateway-status";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { serverFieldErrors } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";

const GatewayFormSchema = z.object({
  provider: z.enum(["isptik", "private"]),
  active: z.boolean(),
  privateStatus: z.enum(["active", "inactive"]),
  name: z.string(),
  send_url: z.string(),
  balance_url: z.string(),
  rates_per_unit: z.string(),
});

type GatewayFormValues = z.infer<typeof GatewayFormSchema>;

const PlatformFormSchema = z.object({
  name: z.string(),
  send_url: z.string().trim().min(1, { message: "sms_sent.gateway.errors.send_url" }),
  rates_per_unit: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "sms_sent.gateway.errors.rate" }),
});

type PlatformFormValues = z.infer<typeof PlatformFormSchema>;

type GatewayError = {
  error?: { code?: string; message?: string };
  errors?: Record<string, string[]>;
};

type GatewayBalance = {
  available?: boolean;
  response_code?: number | string | null;
  balance?: number | string | null;
};

function readProviderBalance(payload: GatewayBalance | undefined): number | null {
  if (!payload) return null;
  const code = payload.response_code;
  if (code !== 202 && code !== "202") return null;
  const balance = payload.balance;
  if (typeof balance === "number" && Number.isFinite(balance)) return balance;
  if (typeof balance === "string" && /^-?\d+(\.\d+)?$/.test(balance.trim())) return Number(balance);
  return null;
}

const INVALIDATE = "sms-gateway,sms-rate,sms-gateway-balance,sms-gateway-platform,settings";

export function useSmsGatewayStatus(enabled = true) {
  const query = useApiQuery<ApiResponse<SmsGatewayStatus>>({
    queryKey: ["sms-gateway"],
    url: "sms-gateway",
    pagination: false,
    enabled,
  });

  return {
    ...query,
    status: query.data?.data,
    isActive: isSmsGatewayActive(query.data?.data),
  };
}

function gatewayErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("error" in error)) return null;
  const code = (error as GatewayError).error?.code;
  return typeof code === "string" ? code : null;
}

export function SmsGatewayButton() {
  const { t } = useTranslation();
  const { status, isLoading, isActive } = useSmsGatewayStatus();
  const [open, setOpen] = useState(false);

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-9 w-64" />
      ) : (
        <MyButton
          type="button"
          action="edit"
          variant="outline"
          className={cn(
            "whitespace-nowrap",
            !status?.configured && "border-destructive/40 text-destructive",
            status?.configured && isActive && "border-green-600/40 text-green-600 dark:border-green-400/40 dark:text-green-400",
            status?.configured && !isActive && "border-yellow-600/40 text-yellow-700 dark:border-yellow-400/40 dark:text-yellow-400"
          )}
          onClick={() => setOpen(true)}
        >
          {isActive ? (
            <CircleCheck className="size-4" aria-hidden />
          ) : (
            <TriangleAlert className="size-4" aria-hidden />
          )}
          {t(
            !status?.configured
              ? "sms_sent.gateway.not_configured"
              : isActive
                ? "sms_sent.gateway.configured"
                : "sms_sent.gateway.inactive"
          )}
        </MyButton>
      )}
      <SmsGatewayDialog open={open} onOpenChange={setOpen} status={status} />
    </>
  );
}

function SmsGatewayDialog({
  open,
  onOpenChange,
  status,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: SmsGatewayStatus | undefined;
}) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [conflict, setConflict] = useState<string | null>(null);
  const [editingPrivate, setEditingPrivate] = useState(false);
  const configured = status?.configured === true;
  const privateConfigured = configured && status?.provider === "private";
  const form = useForm<GatewayFormValues>({
    resolver: zodResolver(GatewayFormSchema),
    values: {
      provider: status?.provider ?? "isptik",
      active: status?.status !== "inactive",
      privateStatus: status?.provider === "private" && status.status === "inactive" ? "inactive" : "active",
      name: status?.provider === "private" ? status.name ?? "" : "",
      send_url: status?.provider === "private" ? status.send_url ?? "" : "",
      balance_url: status?.provider === "private" ? status.balance_url ?? "" : "",
      rates_per_unit:
        status?.provider === "private" && status.rate !== null && status.rate !== undefined
          ? String(status.rate)
          : "",
    },
  });
  const provider = useWatch({ control: form.control, name: "provider" });
  const providerChanged = configured && provider !== status?.provider;
  const balanceEnabled = open && privateConfigured && Boolean(status?.balance_url);
  const balanceQuery = useApiQuery<ApiResponse<GatewayBalance>>({
    queryKey: ["sms-gateway-balance"],
    url: "sms-gateway/balance",
    pagination: false,
    enabled: balanceEnabled,
    retry: false,
  });
  const balanceAmount = readProviderBalance(balanceQuery.data?.data);
  const balanceText = balanceAmount === null
    ? null
    : new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(balanceAmount);
  const canSave = !configured
    ? hasPermission("sms-gateway.create")
    : providerChanged
      ? hasPermission("sms-gateway.switch")
      : hasPermission("sms-gateway.edit");

  const save = useApiMutation<SmsGatewayStatus, Record<string, unknown>>({
    url: !configured ? "sms-gateway" : providerChanged ? "sms-gateway/switch" : "sms-gateway",
    method: !configured || providerChanged ? "POST" : "PUT",
    invalidateKeys: INVALIDATE,
    ignoreError: (error) => gatewayErrorCode(error) === "sms_gateway_pending_queue",
    onSuccess: (saved) => {
      setConflict(null);
      toast.success(
        t(saved.status === "active" ? "sms_sent.gateway.activated" : "sms_sent.gateway.inactive_saved")
      );
      setEditingPrivate(false);
      onOpenChange(false);
    },
    onError: (error) => {
      if (gatewayErrorCode(error) === "sms_gateway_pending_queue") {
        const message = (error as GatewayError).error?.message;
        setConflict(message || t("sms_sent.gateway.pending"));
        return;
      }
      const fields = serverFieldErrors(error);
      Object.entries(fields).forEach(([field, message]) => {
        if (field in form.getValues()) {
          form.setError(field as keyof GatewayFormValues, { message });
        }
      });
    },
  });

  const onSubmit = (values: GatewayFormValues) => {
    setConflict(null);
    const requireUrls = !configured || providerChanged || values.provider === "private" && !status?.masked_send_url;
    if (values.provider === "private") {
      let valid = true;
      if (!values.name.trim()) {
        form.setError("name", { message: t("sms_sent.gateway.errors.name") });
        valid = false;
      }
      if (!/^\d+(\.\d{1,2})?$/.test(values.rates_per_unit.trim())) {
        form.setError("rates_per_unit", { message: t("sms_sent.gateway.errors.rate") });
        valid = false;
      }
      if (requireUrls && !values.send_url.trim()) {
        form.setError("send_url", { message: t("sms_sent.gateway.errors.send_url") });
        valid = false;
      }
      if (!valid) return;
    }

    const payload: Record<string, unknown> =
      values.provider === "isptik"
        ? { provider: "isptik", status: values.active ? "active" : "inactive" }
        : {
          provider: "private",
          status: values.privateStatus,
          name: values.name.trim(),
          rates_per_unit: values.rates_per_unit.trim(),
          ...(values.send_url.trim() ? { send_url: values.send_url.trim() } : {}),
          ...(values.balance_url.trim() ? { balance_url: values.balance_url.trim() } : {}),
        };

    save.mutate(payload);
  };

  const showPrivateForm = provider === "private" && (!privateConfigured || editingPrivate);

  return (
    <MyDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setEditingPrivate(false);
        onOpenChange(next);
      }}
      title="sms_sent.gateway.title"
      description="sms_sent.gateway.description"
      size="2xl"
      loading={save.isPending}
      showFooter={false}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as SmsGatewayProvider)}
                    className="grid gap-3"
                  >
                    <div className="rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="isptik" id="sms-gateway-isptik" className="shrink-0" />
                        <Label htmlFor="sms-gateway-isptik" className="min-w-0 flex-1 truncate font-medium leading-none">
                          {t("sms_sent.gateway.isptik")}
                        </Label>
                        <FormField
                          control={form.control}
                          name="active"
                          render={({ field }) => (
                            <FormItem className="flex shrink-0 items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => field.onChange(checked === true)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal leading-none">{t("sms_sent.gateway.active")}</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <p className="mt-1 pl-7 text-sm text-muted-foreground">
                        {t("sms_sent.gateway.isptik_hint", {
                          rate: status?.platform_rate ?? "—",
                        })}
                      </p>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="private" id="sms-gateway-private" className="shrink-0" />
                        <Label htmlFor="sms-gateway-private" className="min-w-0 flex-1 truncate font-medium leading-none">
                          {privateConfigured ? status?.name || t("sms_sent.gateway.private") : t("sms_sent.gateway.private")}
                        </Label>
                        {privateConfigured ? (
                          <FormField
                            control={form.control}
                            name="privateStatus"
                            render={({ field }) => (
                              <FormItem className="flex shrink-0 items-center gap-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value === "active"}
                                    disabled={!hasPermission("sms-gateway.edit") || save.isPending}
                                    onCheckedChange={(checked) => field.onChange(checked === true ? "active" : "inactive")}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal leading-none">
                                  {t(field.value === "active" ? "sms_sent.gateway.status_active" : "sms_sent.gateway.status_inactive")}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ) : null}
                        {privateConfigured ? (
                          <MyButton
                            type="button"
                            action="edit"
                            size="icon"
                            variant="outline"
                            className="shrink-0"
                            aria-label={t("sms_sent.gateway.edit")}
                            onClick={() => setEditingPrivate(true)}
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 min-h-10 pl-7 text-sm text-muted-foreground">
                        {t("sms_sent.gateway.private_hint", {
                          rate: privateConfigured && status?.rate != null ? status.rate : "—",
                        })}
                        {balanceText ? (
                          <>
                            {" "}
                            <span className="tabular-nums text-foreground">
                              {t("sms_sent.gateway.balance_inline", { balance: balanceText })}
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          {showPrivateForm ? (
            <div className="space-y-3">
              <InputField name="name" label={{ labelText: "sms_sent.gateway.name", mandatory: true }} placeholder="sms_sent.gateway.name" />
              <InputField name="send_url" label={{ labelText: "sms_sent.gateway.send_url", mandatory: true }} placeholder="sms_sent.gateway.send_url_placeholder" />
              <InputField name="balance_url" label={{ labelText: "sms_sent.gateway.balance_url" }} placeholder="sms_sent.gateway.balance_url" />
              <InputField name="rates_per_unit" label={{ labelText: "sms_sent.gateway.rate", mandatory: true }} placeholder="0.35" type="text" />
              <FormField
                control={form.control}
                name="privateStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("sms_sent.gateway.status")}
                      <span className="text-destructive"> *</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">{t("sms_sent.gateway.status_active")}</SelectItem>
                        <SelectItem value="inactive">{t("sms_sent.gateway.status_inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          {conflict ? (
            <p role="alert" className="min-h-10 text-sm text-destructive">
              {conflict}
            </p>
          ) : (
            <div className="min-h-10" />
          )}

          {showPrivateForm || provider !== "private" || privateConfigured ? (
            <div className="flex justify-end">
              <MyButton
                type="submit"
                action={providerChanged ? "move" : "save"}
                title={
                  providerChanged
                    ? "sms_sent.gateway.switch"
                    : privateConfigured
                      ? "sms_sent.gateway.update"
                      : "sms_sent.gateway.save"
                }
                loading={save.isPending}
                disabled={!canSave}
              />
            </div>
          ) : null}
        </form>
      </Form>
      {hasPermission("sms-gateway.platform") ? <PlatformSource /> : null}
    </MyDialog>
  );
}

function PlatformSource() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("sms-gateway.platform.edit");
  const query = useApiQuery<ApiResponse<SmsGatewayStatus>>({
    queryKey: ["sms-gateway-platform"],
    url: "sms-gateway/platform",
    pagination: false,
  });
  const source = query.data?.data;
  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(PlatformFormSchema),
    values: {
      name: source?.name ?? "ISPTIK",
      send_url: "",
      rates_per_unit: source?.rate === null || source?.rate === undefined ? "" : String(source.rate),
    },
  });
  const save = useApiMutation<SmsGatewayStatus, PlatformFormValues>({
    url: "sms-gateway/platform",
    method: "PUT",
    invalidateKeys: INVALIDATE,
    onSuccess: () => {
      toast.success(t("sms_sent.gateway.platform_saved"));
      form.setValue("send_url", "");
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => save.mutate(values))} className="mt-4 space-y-3 border-t pt-4">
        <div>
          <p className="text-sm font-medium">{t("sms_sent.gateway.platform_title")}</p>
          <p className="text-sm text-muted-foreground">{t("sms_sent.gateway.platform_hint")}</p>
        </div>
        {source?.masked_send_url ? (
          <p className="text-sm text-muted-foreground break-all">{source.masked_send_url}</p>
        ) : null}
        <InputField name="name" label={{ labelText: "sms_sent.gateway.name" }} placeholder="ISPTIK" />
        <InputField name="send_url" label={{ labelText: "sms_sent.gateway.send_url" }} placeholder="sms_sent.gateway.send_url_placeholder" />
        <InputField name="rates_per_unit" label={{ labelText: "sms_sent.gateway.rate" }} placeholder="0.35" />
        {canEdit ? (
          <div className="flex justify-end">
            <MyButton action="save" type="submit" title="sms_sent.gateway.platform_save" loading={save.isPending} />
          </div>
        ) : null}
      </form>
    </Form>
  );
}

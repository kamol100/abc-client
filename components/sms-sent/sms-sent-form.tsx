"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, Info, Send } from "lucide-react";
import { FC, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import InputField from "@/components/form/input-field";
import SelectDropdown from "@/components/select-dropdown";
import TextareaField from "@/components/form/textarea-field";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import MyTooltip from "@/components/my-tooltip";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import SmsSentFilterFieldSchema from "@/components/sms-sent/sms-sent-filter-schema";
import SmsSentFormFieldSchema from "@/components/sms-sent/sms-sent-form-schema";
import SmsSentTable from "@/components/sms-sent/sms-sent-table";
import SmsSendConfirmDialog from "@/components/sms-sent/sms-send-confirm-dialog";
import { SettingsSectionButton } from "@/components/settings/settings-section-button";
import { SmsGatewayButton, useSmsGatewayStatus, useSmsProviderBalance } from "@/components/sms-sent/sms-gateway";
import { isSmsGatewayActive } from "@/components/sms-sent/sms-gateway-status";
import {
  SmsSendMode,
  SmsTemplateSummary,
  SmsSentClientFilterSchema as SmsSentClientFilterFormSchema,
  SmsSentClientFilterValues,
  SmsSentFormInput,
  SmsSentFormSchema,
  SmsSentPayload,
  buildSmsSentClientParams,
  buildSmsSentPayload,
  isCustomOtherSmsTemplate,
  isInvoiceDueSmsTemplate,
  usesClientListSmsTemplate,
} from "@/components/sms-sent/sms-sent-type";
import DisplayCount from "@/components/display-count";
import DisplayMoney from "@/components/display-money";
import { Skeleton } from "@/components/ui/skeleton";
import type { LabelProps } from "@/components/form-wrapper/form-builder-type";
import { cn } from "@/lib/utils";

const DEFAULT_FILTER_VALUES: SmsSentClientFilterValues = {
  any: "",
  network_id: null,
  zone_id: null,
  status: "all",
};

type SmsSentFormPageProps = {
  phone?: string;
  mode?: "page";
  clientId?: never;
  onSent?: () => void;
};

type SmsSentFormSingleClientProps = {
  phone: string;
  mode: "singleClient";
  clientId: string;
  onSent?: () => void;
};

type SmsSentFormProps = SmsSentFormPageProps | SmsSentFormSingleClientProps;

function useSmsRate() {
  const { t } = useTranslation();
  const { status, isLoading, isError } = useSmsGatewayStatus();
  const parsedRate = Number(status?.rate);
  const rate = Number.isFinite(parsedRate) ? parsedRate : 0;
  const gatewayName = !status?.configured
    ? null
    : status.provider === "private"
      ? status.name?.trim() || t("sms_sent.gateway.private")
      : t("sms_sent.gateway.isptik");

  return { rate, isLoading, isError, isActive: isSmsGatewayActive(status), gatewayName };
}

function SmsMoneyValue({
  amount,
  isLoading,
  isError,
  inline = false,
}: {
  amount: number;
  isLoading: boolean;
  isError: boolean;
  inline?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className={inline ? "h-4 w-16" : "h-6 w-24"} />;
  }

  if (isError) {
    return <span className={inline ? "inline-block w-16 text-sm" : "text-sm text-muted-foreground"}>—</span>;
  }

  return (
    <DisplayMoney
      amount={amount}
      animate={!inline}
      formatCurrency
      className={cn(
        "font-semibold tabular-nums",
        inline ? "w-16 text-sm leading-none text-foreground" : "text-primary"
      )}
    />
  );
}

function HeaderSlot({
  widthClass,
  children,
}: {
  widthClass: string;
  children: ReactNode;
}) {
  return <span className={cn("inline-flex h-4 items-center", widthClass)}>{children}</span>;
}

function SmsHeaderMeta() {
  const { t } = useTranslation();
  const { rate, isLoading, isError, gatewayName } = useSmsRate();
  const balance = useSmsProviderBalance();
  const showBalance = isLoading || balance.canRead;
  const balancePending = isLoading || balance.isLoading;

  return (
    <div className="mt-1 flex min-h-5 min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground sm:h-5 sm:flex-nowrap sm:whitespace-nowrap">
      <span className="inline-flex shrink-0 items-center gap-1">
        <HeaderSlot widthClass="w-16">
          <SmsMoneyValue amount={rate} isLoading={isLoading} isError={isError} inline />
        </HeaderSlot>
        <span>{t("sms_sent.per_sms_cost.label")}</span>
      </span>
      {showBalance ? (
        <span className="inline-flex shrink-0 items-center gap-1">
          <span aria-hidden="true">·</span>
          <span>{t("sms_sent.gateway.balance_short")}</span>
          <HeaderSlot widthClass="w-[5.5rem]">
            {balancePending || !balance.text ? (
              balancePending ? (
                <Skeleton className="h-4 w-[5.5rem]" />
              ) : (
                <span className="text-sm text-foreground">—</span>
              )
            ) : (
              <span className="text-sm font-semibold tabular-nums text-foreground">{balance.text}</span>
            )}
          </HeaderSlot>
        </span>
      ) : null}
      <span className="inline-flex min-w-0 items-center gap-1">
        <span className="shrink-0" aria-hidden="true">·</span>
        <span className="inline-flex h-4 min-w-16 max-w-full items-center">
          {isLoading ? (
            <Skeleton className="h-4 w-28 max-w-full" />
          ) : (
            <span className="truncate text-sm font-semibold text-foreground">{gatewayName ?? "—"}</span>
          )}
        </span>
      </span>
    </div>
  );
}

const SMS_SEND_MODES = [
  {
    value: "live",
    icon: Send,
    title: "sms_sent.mode.live.title",
    short: "sms_sent.mode.live.short",
  },
  {
    value: "test",
    icon: FlaskConical,
    title: "sms_sent.mode.test.title",
    short: "sms_sent.mode.test.short",
  },
] as const;

export function SmsSendModeSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: SmsSendMode;
  onChange: (mode: SmsSendMode) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <RadioGroup
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (disabled) return;
        if (next === "live" || next === "test") onChange(next);
      }}
      aria-label={t("sms_sent.mode.label")}
      className="flex shrink-0 items-center gap-2"
    >
      {SMS_SEND_MODES.map((mode) => {
        const Icon = mode.icon;
        const selected = value === mode.value;

        return (
          <Label
            key={mode.value}
            htmlFor={`sms-send-mode-${mode.value}`}
            className={cn(
              "relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-sm font-medium leading-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <RadioGroupItem
              id={`sms-send-mode-${mode.value}`}
              value={mode.value}
              aria-label={t(mode.title)}
              className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
            />
            <Icon className="size-3.5 shrink-0" aria-hidden />
            <span>{t(mode.short)}</span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}

const phoneSlotLayerClass =
  "col-start-1 row-start-1 transition-opacity duration-200 motion-reduce:transition-none";

function SmsPhoneFieldSlot({
  showPhoneField,
  name,
  label,
  placeholder,
}: {
  showPhoneField: boolean;
  name: string;
  label?: LabelProps;
  placeholder?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="mt-2 grid">
      <div
        className={cn(
          phoneSlotLayerClass,
          showPhoneField ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!showPhoneField}
        {...(showPhoneField ? {} : { inert: true })}
      >
        <div className="flex h-full flex-col justify-center">
          <InputField name={name} label={label} placeholder={placeholder} type="text" />
        </div>
      </div>
      <div
        className={cn(
          phoneSlotLayerClass,
          showPhoneField ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        aria-hidden={showPhoneField}
        {...(showPhoneField ? { inert: true } : {})}
      >
        <div
          role="note"
          className="relative flex h-full items-center gap-2.5 overflow-hidden rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm leading-snug text-muted-foreground"
        >
          <span className="absolute inset-0 bg-muted/40" aria-hidden />
          <Info className="relative size-4 shrink-0" aria-hidden />
          <p className="relative">{t("sms_sent.phone_number.hint")}</p>
        </div>
      </div>
    </div>
  );
}

const createDefaultSendFormValues = (phone?: string): SmsSentFormInput => ({
  phone: phone ?? "",
  sms_template_id: null,
  sms_body: "",
});

const SmsSentForm: FC<SmsSentFormProps> = ({
  phone,
  mode = "page",
  clientId,
  onSent,
}) => {
  const { t } = useTranslation();
  const isSingleClientMode = mode === "singleClient";
  const [sendMode, setSendMode] = useState<SmsSendMode>("live");
  const isTestMode = sendMode === "test";
  const { rate, isLoading: isRateLoading, isError: isRateError, isActive } = useSmsRate();
  const sendLocked = isRateLoading || !isActive;

  const sendForm = useForm<SmsSentFormInput>({
    resolver: zodResolver(SmsSentFormSchema),
    defaultValues: createDefaultSendFormValues(phone),
  });

  const filterForm = useForm<SmsSentClientFilterValues>({
    defaultValues: DEFAULT_FILTER_VALUES,
  });

  const sendFields = useMemo(() => SmsSentFormFieldSchema(), []);
  const filterFields = useMemo(() => SmsSentFilterFieldSchema(), []);

  const [appliedFilters, setAppliedFilters] =
    useState<SmsSentClientFilterValues>(DEFAULT_FILTER_VALUES);
  const [bulkSmsCount, setBulkSmsCount] = useState(0);
  const [hydratedTemplateId, setHydratedTemplateId] = useState<number | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);
  const [pendingPayload, setPendingPayload] = useState<SmsSentPayload | null>(null);
  const sendLabel = isTestMode ? t("sms_sent.mode.test.submit") : t("sms_sent.send");
  const selectedTemplateId = useWatch({
    control: sendForm.control,
    name: "sms_template_id",
  });
  const phoneNumber = useWatch({
    control: sendForm.control,
    name: "phone",
  });

  const hasTemplateSelected = selectedTemplateId !== null && selectedTemplateId !== undefined;

  const templateDetailsUrl = hasTemplateSelected
    ? `sms-template/${selectedTemplateId}`
    : "";

  const { data: templateDetails } = useApiQuery<ApiResponse<SmsTemplateSummary>>({
    queryKey: ["sms-template-details", selectedTemplateId ?? "none"],
    url: templateDetailsUrl,
    pagination: false,
    enabled: hasTemplateSelected,
  });

  const resolvedTemplate =
    hasTemplateSelected &&
      templateDetails?.data &&
      templateDetails.data.id === Number(selectedTemplateId)
      ? templateDetails.data
      : null;
  const templateType = resolvedTemplate?.template_type ?? null;
  const invoiceDueOnly = isInvoiceDueSmsTemplate(templateType);
  const phoneOnlySend = !hasTemplateSelected || templateType == null || isCustomOtherSmsTemplate(templateType);
  const showClientList = usesClientListSmsTemplate(templateType) && !isSingleClientMode;

  useEffect(() => {
    sendForm.reset(createDefaultSendFormValues(phone));
    setHydratedTemplateId(null);
    setBulkSmsCount(0);
    setSelectedClientIds([]);
  }, [phone, sendForm]);

  useEffect(() => {
    if (!hasTemplateSelected) {
      setHydratedTemplateId(null);
      return;
    }

    const templateData = templateDetails?.data;
    const numericTemplateId = Number(selectedTemplateId);
    if (!templateData || templateData.id !== numericTemplateId) return;
    if (hydratedTemplateId === numericTemplateId) return;

    sendForm.setValue("sms_body", templateData.message ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setHydratedTemplateId(numericTemplateId);
  }, [hasTemplateSelected, hydratedTemplateId, selectedTemplateId, sendForm, templateDetails]);

  useEffect(() => {
    if (!hasTemplateSelected) {
      setBulkSmsCount(0);
    }
  }, [hasTemplateSelected]);

  useEffect(() => {
    setSelectedClientIds([]);
  }, [selectedTemplateId]);

  const clientParams = useMemo(
    () =>
      showClientList
        ? buildSmsSentClientParams(appliedFilters, { invoiceDueOnly })
        : undefined,
    [appliedFilters, showClientList, invoiceDueOnly]
  );

  const templateSelectedClientIds =
    isSingleClientMode && clientId !== undefined ? [clientId] : selectedClientIds;

  const smsCount = phoneOnlySend
    ? phoneNumber?.trim()
      ? 1
      : 0
    : isSingleClientMode
      ? templateSelectedClientIds.length
      : selectedClientIds.length > 0
        ? selectedClientIds.length
        : bulkSmsCount;

  const { mutateAsync: sendSms, isPending } = useApiMutation<unknown, SmsSentPayload>({
    url: "sms-store",
    method: "POST",
    successMessage: isTestMode ? "sms_sent.mode.test.success" : "sms_sent.success",
  });

  const appliedFilterKey = useRef(JSON.stringify(DEFAULT_FILTER_VALUES));

  const applyFilters = (values: unknown) => {
    const parsed = SmsSentClientFilterFormSchema.safeParse(values);
    if (!parsed.success) return;

    const nextKey = JSON.stringify(parsed.data);
    if (appliedFilterKey.current === nextKey) return;

    appliedFilterKey.current = nextKey;
    setAppliedFilters(parsed.data);
    setSelectedClientIds([]);
  };

  const watchedFilters = useWatch({ control: filterForm.control });
  const watchedFilterKey = JSON.stringify(watchedFilters ?? {});

  useEffect(() => {
    if (!hasTemplateSelected || isSingleClientMode) return;

    const timeout = setTimeout(() => {
      applyFilters(watchedFilters);
    }, 400);

    return () => clearTimeout(timeout);
  }, [watchedFilterKey, hasTemplateSelected, isSingleClientMode]);

  const handleFilterSubmit = (values: SmsSentClientFilterValues) => {
    applyFilters(values);
  };

  const handleFilterReset = () => {
    filterForm.reset(DEFAULT_FILTER_VALUES);
    applyFilters(DEFAULT_FILTER_VALUES);
  };

  const handleSelectRow = (clientId: number, selected: boolean) => {
    setSelectedClientIds((prev) =>
      selected ? [...prev, clientId] : prev.filter((id) => id !== clientId)
    );
  };

  const handleSelectAllCurrentPage = (clientIds: number[], selected: boolean) => {
    setSelectedClientIds((prev) => {
      if (selected) {
        const newIds = clientIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      } else {
        return prev.filter((id) => !clientIds.includes(id));
      }
    });
  };

  const onSubmit = (values: SmsSentFormInput) => {
    if (sendLocked) return;
    const normalizedForm = SmsSentFormSchema.parse(values);

    if (isCustomOtherSmsTemplate(templateType) && !normalizedForm.phone?.trim()) {
      sendForm.setError("phone", { message: "sms_sent.phone_number.errors.required" });
      return;
    }

    setPendingPayload(
      buildSmsSentPayload({
        formValues: normalizedForm,
        filterValues: appliedFilters,
        smsCount,
        selectedClientIds: phoneOnlySend ? undefined : templateSelectedClientIds,
        templateType,
        mode: sendMode,
      })
    );
  };

  const handleConfirmSend = async ({ sendNow }: { sendNow: boolean }) => {
    if (!pendingPayload || isPending) return;

    try {
      await sendSms({ ...pendingPayload, send_now: sendNow });
    } catch {
      return;
    } finally {
      setPendingPayload(null);
    }

    sendForm.reset(createDefaultSendFormValues(phone));
    filterForm.reset(DEFAULT_FILTER_VALUES);
    setAppliedFilters(DEFAULT_FILTER_VALUES);
    setSelectedClientIds([]);
    setBulkSmsCount(0);
    setHydratedTemplateId(null);
    onSent?.();
  };

  const phoneField = sendFields.find((field) => field.name === "phone");
  const templateField = sendFields.find((field) => field.name === "sms_template_id");
  const bodyField = sendFields.find((field) => field.name === "sms_body");

  return (
    <div className="space-y-5 pr-3">
      <div className="space-y-4">
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 overflow-hidden">
            {!isSingleClientMode && (
              <>
                <h1 className="text-xl font-semibold leading-none">{t("sms_sent.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("sms_sent.description")}</p>
              </>
            )}
            <SmsHeaderMeta />
          </div>
          <div className="flex flex-col items-end gap-2 justify-self-end">
            {!isSingleClientMode && <SmsGatewayButton />}
            <div className="flex items-center gap-2">
              <SmsSendModeSelector value={sendMode} onChange={setSendMode} disabled={sendLocked} />
              {!isSingleClientMode && <SettingsSectionButton section="sms" />}
            </div>
          </div>
        </div>
      </div>
      <Form {...sendForm}>
        <form
          onSubmit={sendForm.handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border p-4 md:p-5"
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <div>

              {templateField?.type === "dropdown" && (
                <SelectDropdown
                  name={templateField.name}
                  label={templateField.label}
                  placeholder={templateField.placeholder}
                  api={templateField.api}
                  isClearable={templateField.isClearable}
                  onValueChange={(value) => {
                    if (value === null) {
                      setHydratedTemplateId(null);
                    }
                  }}
                />
              )}

              {phoneField?.type === "text" && (
                <SmsPhoneFieldSlot
                  showPhoneField={isCustomOtherSmsTemplate(templateType)}
                  name={phoneField.name}
                  label={phoneField.label}
                  placeholder={phoneField.placeholder}
                />
              )}
              <div className="mt-2">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2">
                  <div className="flex min-w-0 flex-col gap-2">
                    {/* {isTestMode && (
                      <p className="text-sm text-muted-foreground">{t("sms_sent.mode.test.notice")}</p>
                    )} */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {t("sms_sent.sms_count.label")}:
                        </span>
                        <span className="text-base font-semibold tabular-nums">
                          <DisplayCount
                            amount={smsCount}
                            animate
                          />
                        </span>
                      </div>
                      {(smsCount > 1 || (isTestMode && smsCount > 0)) && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {t("sms_sent.total_cost.label")}:
                          </span>
                          <span className={isTestMode ? "line-through opacity-70" : undefined}>
                            <SmsMoneyValue
                              amount={rate * smsCount}
                              isLoading={isRateLoading}
                              isError={isRateError}
                            />
                          </span>
                          {isTestMode && (
                            <span className="text-xs text-muted-foreground">
                              {t("sms_sent.mode.test.not_charged")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {smsCount > 0 ? (
                    <MyButton
                      action="save"
                      type="submit"
                      variant="default"
                      size="default"
                      loading={isPending}
                      disabled={sendLocked}
                      title={sendLabel}
                    >
                      <Send className="size-4" />
                      {sendLabel}
                    </MyButton>
                  ) : (
                    <MyTooltip content="sms_sent.sms_count.zero_tooltip">
                      <MyButton
                        action="save"
                        type="button"
                        variant="default"
                        size="default"
                        disabled
                        title={sendLabel}
                      >
                        <Send className="size-4" />
                        {sendLabel}
                      </MyButton>
                    </MyTooltip>
                  )}
                </div>
              </div>
            </div>
            {bodyField?.type === "textarea" && (
              <TextareaField
                name={bodyField.name}
                label={bodyField.label}
                placeholder={bodyField.placeholder}
                rows={bodyField.rows}
              />
            )}
          </div>



        </form>
      </Form>

      <SmsSendConfirmDialog
        payload={pendingPayload}
        mode={sendMode}
        isSubmitting={isPending}
        onOpenChange={(open) => {
          if (!open && !isPending) setPendingPayload(null);
        }}
        onConfirm={handleConfirmSend}
      />

      {showClientList && (
        <div className="space-y-4 rounded-lg border p-4 md:p-5">
          <div>
            <h2 className="text-base font-semibold">{t("sms_sent.client_list.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t(
                invoiceDueOnly
                  ? "sms_sent.client_list.invoice_due_description"
                  : "sms_sent.client_list.description"
              )}
            </p>
          </div>
          <Form {...filterForm}>
            <form
              onSubmit={filterForm.handleSubmit(handleFilterSubmit)}
              className="flex flex-col gap-3 lg:flex-row lg:items-end"
            >
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {filterFields.map((field) => (
                  <div key={field.name} className="min-w-0">
                    {field.type === "dropdown" ? (
                      <SelectDropdown
                        name={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        api={field.api}
                        options={field.options}
                        isClearable={field.isClearable}
                        onValueChange={(value) => {
                          applyFilters({
                            ...filterForm.getValues(),
                            [field.name]: value,
                          });
                        }}
                      />
                    ) : field.type === "text" ? (
                      <InputField
                        name={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        type="text"
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <MyButton
                  action="search"
                  type="submit"
                  variant="default"
                  size="default"
                />
                <MyButton
                  action="cancel"
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={handleFilterReset}
                />
              </div>
            </form>
          </Form>

          <SmsSentTable
            enabled={showClientList}
            params={clientParams}
            onTotalCountChange={setBulkSmsCount}
            selectedClientIds={selectedClientIds}
            onSelectRow={handleSelectRow}
            onSelectAllCurrentPage={handleSelectAllCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default SmsSentForm;

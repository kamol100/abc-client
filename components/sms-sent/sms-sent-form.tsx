"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import MyButton from "@/components/my-button";
import InputField from "@/components/form/input-field";
import SelectDropdown from "@/components/select-dropdown";
import TextareaField from "@/components/form/textarea-field";
import { Form } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import SmsSentFilterFieldSchema from "@/components/sms-sent/sms-sent-filter-schema";
import SmsSentFormFieldSchema from "@/components/sms-sent/sms-sent-form-schema";
import SmsSentTable from "@/components/sms-sent/sms-sent-table";
import {
  SmsTemplateSummary,
  SmsSentClientFilterSchema as SmsSentClientFilterFormSchema,
  SmsSentClientFilterValues,
  SmsSentClientStatus,
  SmsSentFormInput,
  SmsSentFormSchema,
  SmsSentPayload,
  buildSmsSentClientParams,
  buildSmsSentPayload,
} from "@/components/sms-sent/sms-sent-type";

const DEFAULT_FILTER_VALUES: SmsSentClientFilterValues = {
  pppoe_username: "",
  name: "",
  phone: "",
  network_id: null,
  zone_id: null,
  client_status: "all",
};

type SmsSentFormProps = {
  phone?: string;
};

const SmsSentForm: FC<SmsSentFormProps> = ({ phone }) => {
  const { t } = useTranslation();

  const sendForm = useForm<SmsSentFormInput>({
    resolver: zodResolver(SmsSentFormSchema),
    defaultValues: {
      phone_number: phone ?? "",
      sms_template_id: null,
      sms_body: "",
    },
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

  const selectedTemplateId = useWatch({
    control: sendForm.control,
    name: "sms_template_id",
  });
  const phoneNumber = useWatch({
    control: sendForm.control,
    name: "phone_number",
  });

  const hasTemplateSelected =
    selectedTemplateId !== null && selectedTemplateId !== undefined;

  const templateDetailsUrl = hasTemplateSelected
    ? `sms-templates/${selectedTemplateId}`
    : "";

  const { data: templateDetails } = useApiQuery<ApiResponse<SmsTemplateSummary>>({
    queryKey: ["sms-template-details", selectedTemplateId ?? "none"],
    url: templateDetailsUrl,
    pagination: false,
    enabled: hasTemplateSelected,
  });

  useEffect(() => {
    if (phone) {
      sendForm.setValue("phone_number", phone, { shouldValidate: true });
    }
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

  const clientParams = useMemo(
    () =>
      hasTemplateSelected ? buildSmsSentClientParams(appliedFilters) : undefined,
    [appliedFilters, hasTemplateSelected]
  );

  const smsCount = hasTemplateSelected
    ? bulkSmsCount
    : phoneNumber?.trim()
      ? 1
      : 0;

  const { mutateAsync: sendSms, isPending } = useApiMutation<unknown, SmsSentPayload>({
    url: "sms-store",
    method: "POST",
    successMessage: "sms_sent.success",
  });

  const handleFilterSubmit = (values: SmsSentClientFilterValues) => {
    const normalized = SmsSentClientFilterFormSchema.parse(values);
    setAppliedFilters(normalized);
  };

  const handleFilterReset = () => {
    filterForm.reset(DEFAULT_FILTER_VALUES);
    setAppliedFilters(DEFAULT_FILTER_VALUES);
  };

  const handleStatusChange = (status: SmsSentClientStatus) => {
    filterForm.setValue("client_status", status, { shouldDirty: true });
    const nextValues = SmsSentClientFilterFormSchema.parse({
      ...filterForm.getValues(),
      client_status: status,
    });
    setAppliedFilters(nextValues);
  };

  const onSubmit = async (values: SmsSentFormInput) => {
    const normalizedForm = SmsSentFormSchema.parse(values);
    const payload = buildSmsSentPayload({
      formValues: normalizedForm,
      filterValues: appliedFilters,
      smsCount,
    });

    await sendSms(payload);

    sendForm.reset({
      phone_number: phone ?? "",
      sms_template_id: null,
      sms_body: "",
    });
    filterForm.reset(DEFAULT_FILTER_VALUES);
    setAppliedFilters(DEFAULT_FILTER_VALUES);
    setBulkSmsCount(0);
  };

  const phoneField = sendFields.find((field) => field.name === "phone_number");
  const templateField = sendFields.find((field) => field.name === "sms_template_id");
  const bodyField = sendFields.find((field) => field.name === "sms_body");

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">{t("sms_sent.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("sms_sent.description")}</p>
        </div>

        <Form {...sendForm}>
          <form
            onSubmit={sendForm.handleSubmit(onSubmit)}
            className="space-y-4 rounded-lg border p-4 md:p-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {phoneField?.type === "text" && (
                <InputField
                  name={phoneField.name}
                  label={phoneField.label}
                  placeholder={phoneField.placeholder}
                  type="text"
                />
              )}

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
            </div>

            {bodyField?.type === "textarea" && (
              <TextareaField
                name={bodyField.name}
                label={bodyField.label}
                placeholder={bodyField.placeholder}
                rows={bodyField.rows}
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("sms_sent.sms_count.label")}:
                </span>
                <span className="text-base font-semibold tabular-nums">{smsCount}</span>
              </div>

              {smsCount > 0 ? (
                <MyButton
                  action="save"
                  type="submit"
                  variant="default"
                  size="default"
                  loading={isPending}
                  title={t("sms_sent.send")}
                />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <MyButton
                        action="save"
                        type="button"
                        variant="default"
                        size="default"
                        disabled
                        title={t("sms_sent.send")}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t("sms_sent.sms_count.zero_tooltip")}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </form>
        </Form>

        {hasTemplateSelected && (
          <div className="space-y-4 rounded-lg border p-4 md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">{t("sms_sent.client_list.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("sms_sent.client_list.description")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("sms_sent.sort_option.label")}:
                </span>

                <MyButton
                  type="button"
                  icon={false}
                  size="sm"
                  variant={appliedFilters.client_status === "active" ? "default" : "outline"}
                  title={t("sms_sent.sort_option.active_clients")}
                  onClick={() => handleStatusChange("active")}
                />

                <MyButton
                  type="button"
                  icon={false}
                  size="sm"
                  variant={appliedFilters.client_status === "inactive" ? "default" : "outline"}
                  title={t("sms_sent.sort_option.inactive_clients")}
                  onClick={() => handleStatusChange("inactive")}
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1">
                      <MyButton
                        type="button"
                        icon={false}
                        size="sm"
                        variant={appliedFilters.client_status === "all" ? "default" : "outline"}
                        title={t("sms_sent.sort_option.all_clients")}
                        onClick={() => handleStatusChange("all")}
                      />
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-sm">
                    {t("sms_sent.sort_option.all_clients_tooltip")}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Form {...filterForm}>
              <form
                onSubmit={filterForm.handleSubmit(handleFilterSubmit)}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {filterFields.map((field) => {
                    if (field.type === "dropdown") {
                      return (
                        <SelectDropdown
                          key={field.name}
                          name={field.name}
                          label={field.label}
                          placeholder={field.placeholder}
                          api={field.api}
                          options={field.options}
                          isClearable={field.isClearable}
                        />
                      );
                    }

                    return (
                      <InputField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        type={field.type}
                      />
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <MyButton
                    action="search"
                    type="submit"
                    variant="default"
                    size="default"
                    title={t("sms_sent.filters.apply")}
                  />
                  <MyButton
                    action="cancel"
                    type="button"
                    variant="outline"
                    size="default"
                    title={t("sms_sent.filters.reset")}
                    onClick={handleFilterReset}
                  />
                </div>
              </form>
            </Form>

            <SmsSentTable
              enabled={hasTemplateSelected}
              params={clientParams}
              onTotalCountChange={setBulkSmsCount}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SmsSentForm;

"use client";

import { useTranslation } from "react-i18next";
import { useSetting } from "@/context/app-provider";
import {
  AccordionSection,
  FormFieldConfig,
} from "@/components/form-wrapper/form-builder-type";
import {
  PAYMENT_MODES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "./payment-gateway-type";

export function PaymentGatewayFormFieldSchema(): AccordionSection[] {
  const { t } = useTranslation();
  const roles = useSetting("roles") ?? [];
  const isSuperAdmin = Array.isArray(roles) && roles.includes("Super Admin");

  const providerOptions = PAYMENT_PROVIDERS.map((p) => ({
    value: p,
    label: t(`payment_gateway.provider.options.${p}`),
  }));
  const modeOptions = PAYMENT_MODES.map((m) => ({
    value: m,
    label: t(`payment_gateway.mode.options.${m}`),
  }));
  const statusOptions = PAYMENT_STATUSES.map((s) => ({
    value: s,
    label: t(`payment_gateway.status.options.${s}`),
  }));

  const basicFields: FormFieldConfig[] = [
    {
      type: "text",
      name: "name",
      label: { labelText: "payment_gateway.name.label", mandatory: true },
      placeholder: "payment_gateway.name.placeholder",
    },
    {
      type: "dropdown",
      name: "provider",
      label: { labelText: "payment_gateway.provider.label", mandatory: true },
      placeholder: "payment_gateway.provider.placeholder",
      options: providerOptions,
    },
    {
      type: "dropdown",
      name: "mode",
      label: { labelText: "payment_gateway.mode.label" },
      placeholder: "payment_gateway.mode.placeholder",
      options: modeOptions,
    },
    {
      type: "text",
      name: "integration_type",
      label: { labelText: "payment_gateway.integration_type.label" },
      placeholder: "payment_gateway.integration_type.placeholder",
    },
    {
      type: "text",
      name: "currency",
      label: { labelText: "payment_gateway.currency.label" },
      placeholder: "payment_gateway.currency.placeholder",
    },
    {
      type: "dropdown",
      name: "status",
      label: { labelText: "payment_gateway.status.label" },
      placeholder: "payment_gateway.status.placeholder",
      options: statusOptions,
    },
    {
      type: "switch",
      name: "is_default",
      label: { labelText: "payment_gateway.is_default.label" },
    },
    {
      type: "textarea",
      name: "description",
      label: { labelText: "payment_gateway.description.label" },
      placeholder: "payment_gateway.description.placeholder",
      rows: 2,
      className: "sm:col-span-2",
    },
  ];

  const credentialsFields: FormFieldConfig[] = [
    {
      type: "text",
      name: "base_url",
      label: { labelText: "payment_gateway.base_url.label" },
      placeholder: "payment_gateway.base_url.placeholder",
    },
    {
      type: "text",
      name: "merchant_number",
      label: { labelText: "payment_gateway.merchant_number.label" },
      placeholder: "payment_gateway.merchant_number.placeholder",
    },
    {
      type: "text",
      name: "app_key",
      label: { labelText: "payment_gateway.app_key.label" },
      placeholder: "payment_gateway.app_key.placeholder",
    },
    {
      type: "password",
      name: "app_secret",
      label: { labelText: "payment_gateway.app_secret.label" },
      placeholder: "payment_gateway.app_secret.placeholder",
    },
    {
      type: "text",
      name: "username",
      label: { labelText: "payment_gateway.username.label" },
      placeholder: "payment_gateway.username.placeholder",
    },
    {
      type: "password",
      name: "password",
      label: { labelText: "payment_gateway.password.label" },
      placeholder: "payment_gateway.password.placeholder",
    },
    {
      type: "text",
      name: "api_key",
      label: { labelText: "payment_gateway.api_key.label" },
      placeholder: "payment_gateway.api_key.placeholder",
    },
    {
      type: "password",
      name: "api_secret",
      label: { labelText: "payment_gateway.api_secret.label" },
      placeholder: "payment_gateway.api_secret.placeholder",
    },
    {
      type: "text",
      name: "api_url",
      label: { labelText: "payment_gateway.api_url.label" },
      placeholder: "payment_gateway.api_url.placeholder",
    },
  ];

  const callbackFields: FormFieldConfig[] = [
    {
      type: "text",
      name: "success_url",
      label: { labelText: "payment_gateway.success_url.label" },
      placeholder: "payment_gateway.success_url.placeholder",
    },
    {
      type: "text",
      name: "fail_url",
      label: { labelText: "payment_gateway.fail_url.label" },
      placeholder: "payment_gateway.fail_url.placeholder",
    },
    {
      type: "text",
      name: "cancel_url",
      label: { labelText: "payment_gateway.cancel_url.label" },
      placeholder: "payment_gateway.cancel_url.placeholder",
    },
    {
      type: "text",
      name: "ipn_url",
      label: { labelText: "payment_gateway.ipn_url.label" },
      placeholder: "payment_gateway.ipn_url.placeholder",
    },
  ];

  const feesFields: FormFieldConfig[] = [
    {
      type: "number",
      name: "transaction_fee_percent",
      label: { labelText: "payment_gateway.transaction_fee_percent.label" },
      placeholder: "payment_gateway.transaction_fee_percent.placeholder",
    },
    {
      type: "number",
      name: "transaction_fee_fixed",
      label: { labelText: "payment_gateway.transaction_fee_fixed.label" },
      placeholder: "payment_gateway.transaction_fee_fixed.placeholder",
    },
  ];


  return [
    { name: "payment_gateway.sections.basic", form: basicFields },
    { name: "payment_gateway.sections.credentials", form: credentialsFields },
    { name: "payment_gateway.sections.callbacks", form: callbackFields },
    { name: "payment_gateway.sections.fees", form: feesFields },
  ];
}

export default PaymentGatewayFormFieldSchema;

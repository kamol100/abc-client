import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
  PAYMENT_MODES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "./payment-gateway-type";

const providerOptions = PAYMENT_PROVIDERS.map((p) => ({
  value: p,
  label: `payment_gateway.provider.options.${p}`,
}));

const modeOptions = PAYMENT_MODES.map((m) => ({
  value: m,
  label: `payment_gateway.mode.options.${m}`,
}));

const statusOptions = PAYMENT_STATUSES.map((s) => ({
  value: s,
  label: `payment_gateway.status.options.${s}`,
}));

export const PaymentGatewayFormFieldSchema = (): FieldConfig[] => {
  return [
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
      type: "text",
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
      type: "text",
      name: "password",
      label: { labelText: "payment_gateway.password.label" },
      placeholder: "payment_gateway.password.placeholder",
    },
    //    {
    //   type: "text",
    //   name: "api_key",
    //   label: { labelText: "payment_gateway.api_key.label" },
    //   placeholder: "payment_gateway.api_key.placeholder",
    // },
    // {
    //   type: "password",
    //   name: "api_secret",
    //   label: { labelText: "payment_gateway.api_secret.label" },
    //   placeholder: "payment_gateway.api_secret.placeholder",
    // },
    // {
    //   type: "text",
    //   name: "api_url",
    //   label: { labelText: "payment_gateway.api_url.label" },
    //   placeholder: "payment_gateway.api_url.placeholder",
    // },
    // {
    //   type: "text",
    //   name: "success_url",
    //   label: { labelText: "payment_gateway.success_url.label" },
    //   placeholder: "payment_gateway.success_url.placeholder",
    // },
    // {
    //   type: "text",
    //   name: "fail_url",
    //   label: { labelText: "payment_gateway.fail_url.label" },
    //   placeholder: "payment_gateway.fail_url.placeholder",
    // },
    // {
    //   type: "text",
    //   name: "cancel_url",
    //   label: { labelText: "payment_gateway.cancel_url.label" },
    //   placeholder: "payment_gateway.cancel_url.placeholder",
    // },
    // {
    //   type: "text",
    //   name: "ipn_url",
    //   label: { labelText: "payment_gateway.ipn_url.label" },
    //   placeholder: "payment_gateway.ipn_url.placeholder",
    // },
    // {
    //   type: "number",
    //   name: "transaction_fee_percent",
    //   label: { labelText: "payment_gateway.transaction_fee_percent.label" },
    //   placeholder: "payment_gateway.transaction_fee_percent.placeholder",
    // },
    // {
    //   type: "number",
    //   name: "transaction_fee_fixed",
    //   label: { labelText: "payment_gateway.transaction_fee_fixed.label" },
    //   placeholder: "payment_gateway.transaction_fee_fixed.placeholder",
    // },

    {
      type: "textarea",
      name: "description",
      label: { labelText: "payment_gateway.description.label" },
      placeholder: "payment_gateway.description.placeholder",
      rows: 2,
    },
    {
      type: "switch",
      name: "is_default",
      label: { labelText: "payment_gateway.is_default.label" },
    },
  ];
};

export default PaymentGatewayFormFieldSchema;

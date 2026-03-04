"use client";

import {
  AccordionSection,
  FormFieldConfig,
} from "@/components/form-wrapper/form-builder-type";
import { useSetting } from "@/context/app-provider";
import { useTranslation } from "react-i18next";
import { CHANNEL_TYPES, ACCESS_TYPE_VALUES, STATUS_VALUES } from "./communication-gateway-type";

export function CommunicationGatewayFormFieldSchema(): AccordionSection[] {
  const { t } = useTranslation();
  const roles = useSetting("roles") ?? [];
  const isSuperAdmin =
    Array.isArray(roles) && roles.includes("Super Admin");

  const channelOptions = CHANNEL_TYPES.map((type) => ({
    value: type,
    label: t(`communication_gateway.type.options.${type}`),
  }));

  const statusOptions = STATUS_VALUES.map((s) => ({
    value: s,
    label: t(`communication_gateway.status.options.${s}`),
  }));

  const accessTypeOptions = ACCESS_TYPE_VALUES.map((a) => ({
    value: a,
    label: t(`communication_gateway.access_type.options.${a}`),
  }));

  const basicFields: FormFieldConfig[] = [
    {
      type: "text",
      name: "name",
      label: { labelText: "communication_gateway.name.label", mandatory: true },
      placeholder: "communication_gateway.name.placeholder",
    },
    {
      type: "dropdown",
      name: "type",
      label: { labelText: "communication_gateway.type.label", mandatory: true },
      placeholder: "communication_gateway.type.placeholder",
      options: channelOptions,
    },
    {
      type: "text",
      name: "api",
      label: { labelText: "communication_gateway.api.label", mandatory: true },
      placeholder: "communication_gateway.api.placeholder",
    },
    {
      type: "text",
      name: "balance_api",
      label: { labelText: "communication_gateway.balance_api.label" },
      placeholder: "communication_gateway.balance_api.placeholder",
    },
    {
      type: "number",
      name: "rates_per_unit",
      label: { labelText: "communication_gateway.rates_per_unit.label" },
      placeholder: "communication_gateway.rates_per_unit.placeholder",
    },
    {
      type: "dropdown",
      name: "status",
      label: { labelText: "communication_gateway.status.label" },
      placeholder: "communication_gateway.status.placeholder",
      options: statusOptions,
    },
    {
      type: "dropdown",
      name: "access_type",
      label: { labelText: "communication_gateway.access_type.label" },
      placeholder: "communication_gateway.access_type.placeholder",
      options: accessTypeOptions,
      permission: isSuperAdmin,
    },
  ];

  const credentialsFields: FormFieldConfig[] = [
    { type: "text", name: "api_key", label: { labelText: "communication_gateway.api_key.label" }, placeholder: "communication_gateway.api_key.placeholder" },
    { type: "text", name: "api_secret", label: { labelText: "communication_gateway.api_secret.label" }, placeholder: "communication_gateway.api_secret.placeholder" },
    { type: "text", name: "api_token", label: { labelText: "communication_gateway.api_token.label" }, placeholder: "communication_gateway.api_token.placeholder" },
    { type: "text", name: "api_username", label: { labelText: "communication_gateway.api_username.label" }, placeholder: "communication_gateway.api_username.placeholder" },
    { type: "text", name: "api_password", label: { labelText: "communication_gateway.api_password.label" }, placeholder: "communication_gateway.api_password.placeholder" },
    { type: "text", name: "api_host", label: { labelText: "communication_gateway.api_host.label" }, placeholder: "communication_gateway.api_host.placeholder" },
    { type: "text", name: "api_port", label: { labelText: "communication_gateway.api_port.label" }, placeholder: "communication_gateway.api_port.placeholder" },
    {
      type: "text",
      name: "campaign_id",
      label: { labelText: "communication_gateway.campaign_id.label" },
      placeholder: "communication_gateway.campaign_id.placeholder",
    },
    {
      type: "textarea",
      name: "note",
      label: { labelText: "communication_gateway.note.label" },
      placeholder: "communication_gateway.note.placeholder",
      rows: 3,
    },
  ];

  const adminFields: FormFieldConfig[] = [
    {
      type: "dropdown",
      name: "company_id",
      label: { labelText: "communication_gateway.company.label" },
      placeholder: "communication_gateway.company.placeholder",
      api: "/dropdown-companies",
      valueKey: "company",
      valueMapping: { idKey: "id", labelKey: "name" },
      permission: isSuperAdmin,
    },
    {
      type: "dropdown",
      name: "reseller_id",
      label: { labelText: "communication_gateway.reseller.label" },
      placeholder: "communication_gateway.reseller.placeholder",
      api: "/dropdown-resellers",
      valueKey: "reseller",
      valueMapping: { idKey: "id", labelKey: "name" },
      permission: isSuperAdmin,
    },
  ];

  return [
    { name: "communication_gateway.sections.basic", form: basicFields },
    { name: "communication_gateway.sections.credentials", form: credentialsFields },
    { name: "communication_gateway.sections.admin", form: adminFields },
  ];
}

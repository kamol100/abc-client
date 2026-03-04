"use client";

import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function CommunicationLogFilterSchema(): FieldConfig[] {

  const channelOptions = [
    { value: "sms", label: "communication_log.channel.options.sms" },
    { value: "voice", label: "communication_log.channel.options.voice" },
  ];

  const smsTypeOptions = [
    { value: "custom", label: "communication_log.sms_type.options.custom" },
    { value: "invoice_due", label: "communication_log.sms_type.options.invoice_due" },
    { value: "invoice_due_reminder", label: "communication_log.sms_type.options.invoice_due_reminder" },
    { value: "client_activation", label: "communication_log.sms_type.options.client_activation" },
    { value: "client_deactivation", label: "communication_log.sms_type.options.client_deactivation" },
    { value: "payment_received", label: "communication_log.sms_type.options.payment_received" },
  ];

  const statusOptions = [
    { value: "sent", label: "communication_log.status.options.sent" },
    { value: "failed", label: "communication_log.status.options.failed" },
  ];

  return [
    {
      type: "dropdown",
      name: "channel",
      placeholder: "communication_log.channel.label",
      options: channelOptions,
    },
    {
      type: "text",
      name: "sms_to",
      placeholder: "communication_log.sms_to.label",
    },
    {
      type: "text",
      name: "sms_from",
      placeholder: "communication_log.sms_from.label",
    },
    {
      type: "dropdown",
      name: "sms_type",
      placeholder: "communication_log.sms_type.label",
      options: smsTypeOptions,
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: "communication_log.status.label",
      options: statusOptions,
    },
  ];
}

export default CommunicationLogFilterSchema;

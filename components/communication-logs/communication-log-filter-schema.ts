"use client";

import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function CommunicationLogFilterSchema(): FieldConfig[] {

  const channelOptions = [
    { value: "sms", label: "communication_log.channel.options.sms" },
    { value: "voice", label: "communication_log.channel.options.voice" },
  ];

  const smsTypeOptions = [
    { value: "custom_client", label: "communication_log.sms_type.options.custom_client" },
    { value: "custom_other", label: "communication_log.sms_type.options.custom_other" },
    { value: "invoice_due", label: "communication_log.sms_type.options.invoice_due" },
    { value: "invoice_due_reminder", label: "communication_log.sms_type.options.invoice_due_reminder" },
    { value: "client_activation", label: "communication_log.sms_type.options.client_activation" },
    { value: "client_deactivation", label: "communication_log.sms_type.options.client_deactivation" },
    { value: "payment_received", label: "communication_log.sms_type.options.payment_received" },
  ];

  const statusOptions = [
    { value: "sent", label: "communication_log.status.options.sent" },
    { value: "failed", label: "communication_log.status.options.failed" },
    { value: "simulated", label: "communication_log.status.options.simulated" },
  ];

  return [
    {
      // Searches SMS to, SMS from and the message body as you type.
      type: "text",
      name: "any",
      placeholder: "communication_log.any_search.placeholder",
    },
    {
      type: "dropdown",
      name: "channel",
      placeholder: "communication_log.channel.label",
      options: channelOptions,
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
    {
      // One day, or a range (both days included).
      type: "dateRange",
      name: "sent_at",
      placeholder: "communication_log.sent_at.label",
      closeOnSelectDate: false,
    },
  ];
}

export default CommunicationLogFilterSchema;

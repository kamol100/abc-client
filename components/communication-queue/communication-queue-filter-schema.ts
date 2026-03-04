"use client";

import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function communicationQueueFilterSchema(): FieldConfig[] {
  const smsTypeOptions = [
    { value: "custom", label: "communication_queue.sms_type.options.custom" },
    { value: "invoice_due", label: "communication_queue.sms_type.options.invoice_due" },
    {
      value: "invoice_due_reminder",
      label: "communication_queue.sms_type.options.invoice_due_reminder",
    },
  ];

  const statusOptions = [
    { value: "pending", label: "communication_queue.status.options.pending" },
    { value: "stop", label: "communication_queue.status.options.stop" },
    { value: "failed", label: "communication_queue.status.options.failed" },
    { value: "completed", label: "communication_queue.status.options.completed" },
    { value: "processing", label: "communication_queue.status.options.processing" },
  ];

  return [
    {
      type: "text",
      name: "sms_to",
      placeholder: "communication_queue.sms_to.label",
    },
    {
      type: "text",
      name: "sms_from",
      placeholder: "communication_queue.sms_from.label",
    },
    {
      type: "dropdown",
      name: "sms_type",
      placeholder: "communication_queue.sms_type.label",
      options: smsTypeOptions,
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: "communication_queue.status.label",
      options: statusOptions,
    },
  ];
}

export default communicationQueueFilterSchema;

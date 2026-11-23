"use client";

import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

/** `archive`: the deleted-SMS list, which can also filter by Deleted At. */
export function communicationQueueFilterSchema({ archive = false }: { archive?: boolean } = {}): FieldConfig[] {
  const smsTypeOptions = [
    { value: "custom_client", label: "communication_queue.sms_type.options.custom_client" },
    { value: "custom_other", label: "communication_queue.sms_type.options.custom_other" },
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

  const fields: FieldConfig[] = [
    {
      // Searches SMS to, SMS from, message and comment as you type.
      type: "text",
      name: "any",
      placeholder: "communication_queue.any_search.placeholder",
      watchForFilter: true,
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
    {
      // One day, or a range (both days included).
      type: "dateRange",
      name: "send_at",
      placeholder: "communication_queue.send_at.label",
      closeOnSelectDate: false,
    },
    {
      type: "dateRange",
      name: "expire_at",
      placeholder: "communication_queue.expire_at.label",
      closeOnSelectDate: false,
    },
  ];

  if (archive) {
    fields.push({
      type: "dateRange",
      name: "deleted_at",
      placeholder: "communication_queue.deleted_at.label",
      closeOnSelectDate: false,
    });
  }

  return fields;
}

export default communicationQueueFilterSchema;

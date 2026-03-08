"use client";

import { usePermissions } from "@/context/app-provider";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import SmsTemplateForm from "@/components/sms-templates/sms-template-form";
import {
  SMS_TEMPLATE_TYPE_LABEL_KEYS,
  SmsTemplateRow,
  SmsTemplateType,
} from "@/components/sms-templates/sms-template-type";

export function useSmsTemplateColumns(): ColumnDef<SmsTemplateRow>[] {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sms_template.name.label" />
      ),
      cell: ({ row }) => <div className="capitalize">{row.original.name}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "template_type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="sms_template.template_type.label"
        />
      ),
      cell: ({ row }) => {
        const type = row.original.template_type as SmsTemplateType;
        const labelKey = SMS_TEMPLATE_TYPE_LABEL_KEYS[type];
        return <div>{labelKey ? t(labelKey) : row.original.template_type}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sms_template.message.label" />
      ),
      cell: ({ row }) => (
        <div
          className="max-w-[280px] truncate sm:max-w-[360px]"
          title={row.original.message ?? undefined}
        >
          {row.original.message ?? ""}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          className="mr-3 flex justify-end capitalize"
          title="common.actions"
        />
      ),
      cell: ({ row }) => {
        const smsTemplate = row.original;
        const canEdit = hasPermission("sms-templates.edit");
        const canDelete =
          hasPermission("sms-templates.delete") &&
          (smsTemplate.deletable === 1 || smsTemplate.deletable === undefined);

        if (!canEdit && !canDelete) return null;

        return (
          <div className="mr-3 flex items-end justify-end gap-2">
            {canEdit && (
              <SmsTemplateForm
                mode="edit"
                data={{ id: smsTemplate.id }}
                api="/sms-templates"
                method="PUT"
              />
            )}
            {canDelete && (
              <DeleteModal
                api_url={`/sms-templates/${smsTemplate.id}`}
                keys="sms-templates"
                confirmMessage="sms_template.delete_confirmation"
                buttonText="common.confirm_delete"
              />
            )}
          </div>
        );
      },
    },
  ];
}

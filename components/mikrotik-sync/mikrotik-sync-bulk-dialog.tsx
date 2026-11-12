"use client";

import { ReactNode } from "react";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { MyDialog, useMyDialogClose } from "@/components/my-dialog";

const MikrotikSyncBulkSchema = z
  .object({
    import_as: z.enum(["own", "reseller"]),
    reseller_id: z.number().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.import_as === "reseller" && !value.reseller_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reseller_id"],
        message: "mikrotik_sync.bulk.reseller.errors.required",
      });
    }
  });

function MikrotikSyncBulkFieldSchema(): FormFieldConfig[] {
  return [
    {
      type: "radio",
      name: "import_as",
      label: { labelText: "mikrotik_sync.bulk.import_as.label" },
      direction: "col",
      defaultValue: "own",
      options: [
        { label: "mikrotik_sync.bulk.import_as.options.own", value: "own" },
        { label: "mikrotik_sync.bulk.import_as.options.reseller", value: "reseller" },
      ],
    },
    {
      type: "dropdown",
      name: "reseller_id",
      label: { labelText: "mikrotik_sync.bulk.reseller.label", mandatory: true },
      placeholder: "mikrotik_sync.bulk.reseller.placeholder",
      api: "/dropdown-resellers",
      valueMapping: { idKey: "id", labelKey: "name" },
      isClearable: true,
      visibleWhen: { field: "import_as", equals: "reseller", resetValue: null },
    },
  ];
}

type MikrotikSyncBulkDialogProps = {
  trigger: ReactNode;
  allImport: boolean;
  importIds: string[];
  onImported: () => void;
};

function MikrotikSyncBulkForm({
  allImport,
  importIds,
  onImported,
}: Omit<MikrotikSyncBulkDialogProps, "trigger">) {
  const closeDialog = useMyDialogClose();

  return (
    <FormBuilder
      formSchema={MikrotikSyncBulkFieldSchema()}
      schema={MikrotikSyncBulkSchema}
      data={{ import_as: "own", reseller_id: null }}
      api="/mikrotik-sync/bulk-import"
      mode="create"
      method="POST"
      queryKey="mikrotik-sync"
      successMessage="mikrotik_sync.messages.bulk_import_queued"
      submitTitle="mikrotik_sync.actions.import"
      submitHoldMs={15_000}
      grids={1}
      onClose={() => {
        onImported();
        closeDialog?.();
      }}
      transformPayload={(values) => ({
        import_id: allImport ? [] : importIds,
        all_import: allImport,
        reseller_id:
          values.import_as === "reseller" && typeof values.reseller_id === "number"
            ? values.reseller_id
            : null,
      })}
    />
  );
}

export default function MikrotikSyncBulkDialog({
  trigger,
  allImport,
  importIds,
  onImported,
}: MikrotikSyncBulkDialogProps) {
  return (
    <MyDialog
      size="md"
      title="mikrotik_sync.bulk.title"
      description="mikrotik_sync.bulk.description"
      trigger={trigger}
    >
      <MikrotikSyncBulkForm
        allImport={allImport}
        importIds={importIds}
        onImported={onImported}
      />
    </MyDialog>
  );
}

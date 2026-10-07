"use client";

import { ReactNode } from "react";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { MyDialog, useMyDialogClose } from "@/components/my-dialog";

const ImportClientBulkSchema = z.object({
    import_as: z.enum(["own", "reseller"]),
    reseller_id: z.number().nullable().optional(),
}).superRefine((value, ctx) => {
    if (value.import_as === "reseller" && !value.reseller_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["reseller_id"],
            message: "import_client.bulk.reseller.errors.required",
        });
    }
});

function ImportClientBulkFieldSchema(): FormFieldConfig[] {
    return [
        {
            type: "radio",
            name: "import_as",
            label: { labelText: "import_client.bulk.import_as.label" },
            direction: "col",
            defaultValue: "own",
            options: [
                { label: "import_client.bulk.import_as.options.own", value: "own" },
                { label: "import_client.bulk.import_as.options.reseller", value: "reseller" },
            ],
        },
        {
            type: "dropdown",
            name: "reseller_id",
            label: { labelText: "import_client.bulk.reseller.label", mandatory: true },
            placeholder: "import_client.bulk.reseller.placeholder",
            api: "/dropdown-resellers",
            valueMapping: { idKey: "id", labelKey: "name" },
            isClearable: true,
            visibleWhen: { field: "import_as", equals: "reseller", resetValue: null },
        },
    ];
}

type ImportClientBulkDialogProps = {
    trigger: ReactNode;
    allImport: boolean;
    importIds: number[];
    onImported: () => void;
};

const ImportClientBulkForm = ({
    allImport,
    importIds,
    onImported,
}: Omit<ImportClientBulkDialogProps, "trigger">) => {
    const closeDialog = useMyDialogClose();

    return (
        <FormBuilder
            formSchema={ImportClientBulkFieldSchema()}
            schema={ImportClientBulkSchema}
            data={{ import_as: "own", reseller_id: null }}
            api="/sync-clients/bulk-import"
            mode="create"
            method="POST"
            queryKey="sync-clients"
            successMessage="import_client.messages.bulk_import_queued"
            submitTitle="import_client.actions.import"
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
};

const ImportClientBulkDialog = ({
    trigger,
    allImport,
    importIds,
    onImported,
}: ImportClientBulkDialogProps) => {
    return (
        <MyDialog
            size="md"
            title="import_client.bulk.title"
            description="import_client.bulk.description"
            trigger={trigger}
        >
            <ImportClientBulkForm
                allImport={allImport}
                importIds={importIds}
                onImported={onImported}
            />
        </MyDialog>
    );
};

export default ImportClientBulkDialog;

"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ColumnDef, Row } from "@tanstack/react-table";
import { RotateCcw, Trash2, TriangleAlert } from "lucide-react";
import { z } from "zod";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import FormBuilder, { VisibleFormField } from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { FormLoader } from "@/components/loader";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import ClientNamePhoneCell from "@/components/clients/client-name-phone-cell";
import ClientZoneAddressCell from "@/components/clients/client-zone-address-cell";
import ClientPackageCell from "@/components/clients/client-package-cell";
import { getClientId } from "@/components/clients/client-type";
import {
    ArchivedClientRestoreSchema,
    ArchivedClientRow,
} from "@/components/archived-clients/archived-client-type";

const ResellerOptionSchema = z.object({
    id: z.number(),
    name: z.string(),
}).passthrough();

function archivedDate(value: string | null | undefined): string {
    if (!value) return "—";
    const parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "dd MMM yyyy");
}

function restoreFields(): FormFieldConfig[] {
    return [
        {
            type: "radio",
            name: "mode",
            label: { labelText: "archived_client.mode.label" },
            direction: "col",
            defaultValue: "own",
            options: [
                { label: "archived_client.mode.options.own", value: "own" },
                { label: "archived_client.mode.options.reseller", value: "reseller" },
            ],
        },
        {
            type: "dropdown",
            name: "reseller_id",
            label: { labelText: "archived_client.reseller.label", mandatory: true },
            placeholder: "archived_client.reseller.placeholder",
            api: "/dropdown-resellers/company",
            valueMapping: { idKey: "id", labelKey: "name" },
            isClearable: true,
            visibleWhen: { field: "mode", equals: "reseller", resetValue: null },
        },
    ];
}

function ResellerPreselect({ resellerId }: { resellerId: number | null }) {
    const mode = useWatch({ name: "mode" });
    const current = useWatch({ name: "reseller_id" });
    const { setValue } = useFormContext();

    useEffect(() => {
        if (mode !== "reseller" || resellerId === null) return;
        if (current === resellerId) return;
        if (current !== null && current !== undefined && current !== "") return;
        setValue("reseller_id", resellerId, { shouldValidate: true, shouldDirty: false });
    }, [mode, resellerId, current, setValue]);

    return null;
}

function RestoreArchivedClientForm({
    clientId,
    resellerId,
    onRestored,
}: {
    clientId: string;
    resellerId: number | null;
    onRestored: () => void;
}) {
    const fields = restoreFields();

    return (
        <FormBuilder
            formSchema={fields}
            schema={ArchivedClientRestoreSchema}
            data={{
                mode: resellerId ? "reseller" : "own",
                reseller_id: resellerId,
            }}
            api={`/archived-clients/${clientId}/restore`}
            mode="create"
            method="POST"
            queryKey="archived-clients,clients"
            successMessage="archived_client.messages.restored"
            submitTitle="archived_client.actions.restore"
            grids={1}
            onClose={onRestored}
            transformPayload={(values) => ({
                mode: values.mode,
                reseller_id: values.mode === "reseller" ? values.reseller_id : null,
            })}
        >
            {(renderField) => (
                <div className="grid gap-4">
                    <ResellerPreselect resellerId={resellerId} />
                    {fields.map((field) => (
                        <VisibleFormField key={field.name} field={field}>
                            {renderField(field)}
                        </VisibleFormField>
                    ))}
                </div>
            )}
        </FormBuilder>
    );
}

function RestoreArchivedClientBody({
    client,
    open,
    onRestored,
}: {
    client: ArchivedClientRow;
    open: boolean;
    onRestored: () => void;
}) {
    const clientId = getClientId(client) ?? "";
    const { data, isLoading, isError } = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["dropdown-resellers", "archived-restore", clientId],
        url: "dropdown-resellers/company",
        pagination: false,
        enabled: open,
    });

    const parsed = z.array(ResellerOptionSchema).safeParse(data?.data);
    const resellers = parsed.success ? parsed.data : [];
    const previousId = client.reseller?.id ?? null;
    const validResellerId = !isError && previousId !== null && resellers.some((reseller) => reseller.id === previousId)
        ? previousId
        : null;

    if (isLoading) return <FormLoader />;

    return (
        <RestoreArchivedClientForm
            key={validResellerId ?? "own"}
            clientId={clientId}
            resellerId={validResellerId}
            onRestored={onRestored}
        />
    );
}

function DeleteArchivedClientDialog({
    client,
    open,
    onOpenChange,
}: {
    client: ArchivedClientRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const clientId = getClientId(client) ?? "";
    const { mutateAsync: deleteClient, isPending } = useApiMutation({
        url: `/archived-clients/${clientId}`,
        method: "DELETE",
        invalidateKeys: "archived-clients",
        successMessage: "archived_client.messages.deleted",
        defaultErrorMessage: "common.delete_failed",
    });

    const handleDelete = async (close: () => void) => {
        await deleteClient();
        close();
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            loading={isPending}
            footer={({ close, loading }) => (
                <>
                    <MyButton
                        action="cancel"
                        variant="outline"
                        size="default"
                        onClick={close}
                        disabled={loading}
                        title={t("common.cancel")}
                    />
                    <MyButton
                        action="delete"
                        variant="default"
                        size="default"
                        onClick={() => handleDelete(close)}
                        disabled={loading}
                        loading={loading}
                        title={t("archived_client.actions.permanent_delete")}
                    />
                </>
            )}
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <TriangleAlert className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <DialogTitle className="text-center">
                        {t("archived_client.permanent_delete_title")}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t("archived_client.delete_confirmation")}
                    </DialogDescription>
                </div>
            </div>
        </MyDialog>
    );
}

function ArchivedClientActions({ row }: { row: Row<ArchivedClientRow> }) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [restoreOpen, setRestoreOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const client = row.original;
    const canRestore = hasPermission("archived-clients.restore");
    const canDelete = hasPermission("archived-clients.delete");

    if (!canRestore && !canDelete) return null;

    return (
        <div className="flex items-end justify-end">
            <DataTableRowActions row={row}>
                {canRestore && (
                    <DropdownMenuItem onSelect={() => setRestoreOpen(true)} className="cursor-pointer">
                        <RotateCcw />
                        {t("archived_client.actions.restore")}
                    </DropdownMenuItem>
                )}
                {canDelete && (
                    <DropdownMenuItem
                        onSelect={() => setDeleteOpen(true)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                    >
                        <Trash2 />
                        {t("archived_client.actions.permanent_delete")}
                    </DropdownMenuItem>
                )}
            </DataTableRowActions>
            {canRestore && (
                <MyDialog
                    open={restoreOpen}
                    onOpenChange={setRestoreOpen}
                    size="md"
                    title="archived_client.restore_title"
                    description="archived_client.restore_description"
                >
                    <RestoreArchivedClientBody
                        client={client}
                        open={restoreOpen}
                        onRestored={() => setRestoreOpen(false)}
                    />
                </MyDialog>
            )}
            {canDelete && (
                <DeleteArchivedClientDialog
                    client={client}
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                />
            )}
        </div>
    );
}

export function useArchivedClientColumns(): ColumnDef<ArchivedClientRow>[] {
    const { t } = useTranslation();

    return [
        {
            id: "sid",
            accessorKey: "sid",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.sid" />
            ),
            cell: ({ row }) => <span className="text-sm font-semibold">{row.original.sid || "—"}</span>,
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "id_name_phone",
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.id_name_phone" />
            ),
            cell: ({ row }) => <ClientNamePhoneCell client={row.original} />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "zone_address_network",
            accessorKey: "zone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.zone_address_network" />
            ),
            cell: ({ row }) => <ClientZoneAddressCell client={row.original} />,
            enableSorting: false,
        },
        {
            id: "connection_package",
            accessorKey: "package",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.connection_package" />
            ),
            cell: ({ row }) => <ClientPackageCell client={row.original} />,
            enableSorting: false,
        },
        {
            id: "reseller",
            accessorKey: "reseller",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="archived_client.reseller.label" />
            ),
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.reseller?.name || t("archived_client.company_owned")}
                </span>
            ),
            enableSorting: false,
        },
        {
            id: "deleted_at",
            accessorKey: "deleted_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="archived_client.deleted_at" />
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{archivedDate(row.original.deleted_at)}</span>
            ),
            enableSorting: false,
        },
        {
            id: "status",
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.status.label" />
            ),
            cell: ({ row }) => (
                <span className="text-sm">
                    {Number(row.original.status) === 1 ? t("common.active") : t("common.inactive")}
                </span>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    className="flex justify-end capitalize"
                    title="common.actions"
                />
            ),
            cell: ({ row }) => <ArchivedClientActions row={row} />,
        },
    ];
}

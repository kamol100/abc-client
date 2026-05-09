"use client";

import { type FC, type ReactNode, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { type FieldValues, useFormContext } from "react-hook-form";
import { MyDialog } from "@/components/my-dialog";
import FormTrigger from "@/components/form-trigger";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TicketCreateSchema, type TicketCreatePayload } from "@/components/tickets/ticket-type";
import TicketCreateFormFieldSchema from "@/components/tickets/ticket-form-schema";

type TicketFieldName =
    | "client_id"
    | "subject_id"
    | "tag_id"
    | "assigned_to"
    | "priority"
    | "status"
    | "message";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Record<string, unknown>;
    embed?: boolean;
    omitFieldNames?: readonly TicketFieldName[];
    defaultValues?: Partial<TicketCreatePayload>;
    onClose?: () => void;
}

const EMPTY_TICKET_DEFAULT_VALUES: Partial<TicketCreatePayload> = {};
const EMPTY_OMITTED_FIELD_NAMES: readonly TicketFieldName[] = [];
const TWO_COLUMN_FIELD_NAMES: readonly TicketFieldName[] = [
    "client_id",
    "subject_id",
    "tag_id",
    "assigned_to",
    "priority",
    "status",
];

const HiddenDefaultFields: FC<{ values: Record<string, unknown> }> = ({ values }) => {
    const { register, setValue } = useFormContext<FieldValues>();

    useEffect(() => {
        Object.entries(values).forEach(([name, value]) => {
            setValue(name, value, { shouldValidate: false });
        });
    }, [setValue, values]);

    return (
        <>
            {Object.entries(values).map(([name, value]) => (
                <input
                    key={name}
                    type="hidden"
                    defaultValue={String(value)}
                    {...register(name)}
                />
            ))}
        </>
    );
};

const TicketForm: FC<Props> = ({
    mode = "create",
    api = "/tickets",
    method = "POST",
    data = undefined,
    embed = false,
    omitFieldNames = EMPTY_OMITTED_FIELD_NAMES,
    defaultValues = EMPTY_TICKET_DEFAULT_VALUES,
    onClose,
}) => {
    const searchParams = useSearchParams();
    const clientId = searchParams.get("client_id");

    const formSchema = TicketCreateFormFieldSchema();
    const omittedFieldNameSet = useMemo(() => new Set<TicketFieldName>(omitFieldNames), [omitFieldNames]);

    const formData = useMemo(
        () =>
            ({
                client_id: clientId ? Number(clientId) : undefined,
                priority: "medium",
                status: "open",
                message: "",
                tag_id: [],
                ...defaultValues,
            }) as Record<string, unknown>,
        [clientId, defaultValues]
    );

    const hiddenDefaultValues = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(defaultValues).filter(([, value]) => value !== undefined && value !== null)
            ) as Record<string, unknown>,
        [defaultValues]
    );

    const builderData = useMemo(
        () => (mode === "create" ? { ...formData, ...data } : data),
        [data, formData, mode]
    );

    const renderFieldByName = (
        name: TicketFieldName,
        renderField: (field: FormFieldConfig) => ReactNode
    ) => {
        if (omittedFieldNameSet.has(name)) return null;

        const field = formSchema.find((schemaField) => schemaField.name === name);
        return field ? renderField(field) : null;
    };

    const renderFieldRows = (
        renderField: (field: FormFieldConfig) => ReactNode
    ) => {
        const fields = TWO_COLUMN_FIELD_NAMES
            .map((name) => ({
                name,
                field: renderFieldByName(name, renderField),
            }))
            .filter(({ field }) => field !== null && field !== undefined && field !== false);

        if (fields.length === 0) return null;

        const rows = Array.from({ length: Math.ceil(fields.length / 2) }, (_, index) =>
            fields.slice(index * 2, index * 2 + 2)
        );

        return rows.map((row) => (
            <div key={row.map(({ name }) => name).join("-")} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {row.map(({ name, field }) => (
                    <div key={name}>{field}</div>
                ))}
            </div>
        ));
    };

    const renderFullWidthField = (
        name: TicketFieldName,
        renderField: (field: FormFieldConfig) => ReactNode
    ) => {
        const field = renderFieldByName(name, renderField);
        return field ? <div>{field}</div> : null;
    };

    const formContent = (
        <FormBuilder
            key={`ticket-create-${clientId ?? "default"}`}
            formSchema={formSchema}
            grids={2}
            data={builderData}
            api={api}
            mode={mode}
            schema={TicketCreateSchema}
            method={method}
            queryKey="tickets"
            successMessage="ticket.create_success"
            onClose={onClose}
        >
            {(renderField) => (
                <div className="space-y-4">
                    <HiddenDefaultFields values={hiddenDefaultValues} />
                    {renderFieldRows(renderField)}
                    {renderFullWidthField("message", renderField)}
                </div>
            )}
        </FormBuilder>
    );

    if (embed) {
        return formContent;
    }

    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "ticket.create_title" : "ticket.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            {formContent}
        </MyDialog>
    );
};

export default TicketForm;

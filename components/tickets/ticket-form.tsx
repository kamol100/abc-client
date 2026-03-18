"use client";

import { FC, ReactNode, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MyDialog } from "@/components/my-dialog";
import FormTrigger from "@/components/form-trigger";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { usePermissions } from "@/context/app-provider";
import { TicketCreateSchema } from "./ticket-type";
import TicketCreateFormFieldSchema from "./ticket-form-schema";
import { TagRow } from "../tags/tag-type";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<TagRow> & { id: number };
}

const TicketForm: FC<Props> = ({
    mode = "create",
    api = "/tickets",
    method = "POST",
    data = undefined,
}) => {
    const searchParams = useSearchParams();
    const clientId = searchParams.get("client_id");

    const formSchema = TicketCreateFormFieldSchema();

    const formData = useMemo(
        () =>
            ({
                client_id: clientId ? Number(clientId) : undefined,
                priority: "medium",
                status: "open",
                message: "",
                tag_id: [],
            }) as Record<string, unknown>,
        [clientId]
    );

    const renderFieldByName = (
        name: string,
        renderField: (field: FormFieldConfig) => ReactNode
    ) => {
        const field = formSchema.find((schemaField) => schemaField.name === name);
        return field ? renderField(field) : null;
    };

    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "ticket.create_title" : "ticket.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >

            <FormBuilder
                key={`ticket-create-${clientId ?? "default"}`}
                formSchema={formSchema}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={TicketCreateSchema}
                method={method}
                queryKey="tickets"
                successMessage="ticket.create_success"
            >
                {(renderField) => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>{renderFieldByName("client_id", renderField)}</div>
                            <div>{renderFieldByName("subject_id", renderField)}</div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>{renderFieldByName("tag_id", renderField)}</div>
                            <div>{renderFieldByName("assigned_to", renderField)}</div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>{renderFieldByName("priority", renderField)}</div>
                            <div>{renderFieldByName("status", renderField)}</div>
                        </div>
                        <div>{renderFieldByName("message", renderField)}</div>
                    </div>
                )}
            </FormBuilder>
        </MyDialog>
    );
};

export default TicketForm;

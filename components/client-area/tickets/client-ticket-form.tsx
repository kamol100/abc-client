"use client";

import { FC, ReactNode, useMemo } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormTrigger from "@/components/form-trigger";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import ClientTicketFormFieldSchema from "./client-ticket-form-schema";
import { ClientTicketCreateSchema } from "./client-ticket-type";

const ClientTicketForm: FC = () => {
  const formSchema = ClientTicketFormFieldSchema();

  const formData = useMemo(
    () =>
      ({
        priority: "medium",
        message: "",
      }) as Record<string, unknown>,
    [],
  );

  const renderFieldByName = (
    name: string,
    renderField: (field: FormFieldConfig) => ReactNode,
  ) => {
    const field = formSchema.find((f) => f.name === name);
    return field ? renderField(field) : null;
  };

  return (
    <MyDialog
      size="lg"
      title="ticket.create_title"
      trigger={<FormTrigger mode="create" />}
    >
      <FormBuilder
        formSchema={formSchema}
        grids={2}
        data={formData}
        api="/client-tickets"
        mode="create"
        schema={ClientTicketCreateSchema}
        method="POST"
        queryKey="client-tickets"
        successMessage="ticket.create_success"
      >
        {(renderField) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>{renderFieldByName("subject_id", renderField)}</div>
              <div>{renderFieldByName("priority", renderField)}</div>
            </div>
            <div>{renderFieldByName("message", renderField)}</div>
          </div>
        )}
      </FormBuilder>
    </MyDialog>
  );
};

export default ClientTicketForm;

"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { InvoiceTypeFormSchema, InvoiceTypeRow } from "./invoice-type-type";
import InvoiceTypeFormFieldSchema from "./invoice-type-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<InvoiceTypeRow> & { id: number };
};

const InvoiceTypeForm: FC<Props> = ({
    mode = "create",
    api = "/invoice-types",
    method = "POST",
    data = undefined,
}) => {
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "invoice_type.create_title" : "invoice_type.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={InvoiceTypeFormFieldSchema()}
                grids={1}
                data={data}
                api={api}
                mode={mode}
                schema={InvoiceTypeFormSchema}
                method={method}
                queryKey="invoice-types"
            />
        </MyDialog>
    );
};

export default InvoiceTypeForm;

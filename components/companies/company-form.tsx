"use client";

import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import {
    CompanyFormSchema,
    CompanyCreateFormSchema,
    CompanyRow,
} from "@/components/companies/company-type";
import CompanyFormFieldSchema from "@/components/companies/company-form-schema";
import FormTrigger from "@/components/form-trigger";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<CompanyRow> & { id?: number };
};

const CompanyForm: FC<Props> = ({
    mode = "create",
    api = "companies",
    method = "POST",
    data = undefined,
}) => {
    const schema = mode === "create" ? CompanyCreateFormSchema : CompanyFormSchema;
    const formSchema = CompanyFormFieldSchema(mode);

    return (
        <DialogWrapper
            size="3xl"
            title={mode === "create" ? "company.create_title" : "company.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={formSchema}
                grids={2}
                data={data as Record<string, unknown>}
                api={api}
                mode={mode}
                schema={schema}
                method={method}
                queryKey="companies"
            />
        </DialogWrapper>
    );
};

export default CompanyForm;

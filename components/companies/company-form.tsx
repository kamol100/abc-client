"use client";

import type { FC, ReactNode } from "react";
import { MyDialog } from "@/components/my-dialog";
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
    referral?: { uuid: string; prospectName: string };
    trigger?: ReactNode;
};

const CompanyForm: FC<Props> = ({
    mode = "create",
    api = "companies",
    method = "POST",
    data = undefined,
    referral,
    trigger,
}) => {
    const schema = mode === "create" ? CompanyCreateFormSchema : CompanyFormSchema;
    const formSchema = CompanyFormFieldSchema(mode);

    return (
        <MyDialog
            size="3xl"
            title={mode === "create" ? "company.create_title" : "company.edit_title"}
            trigger={trigger ?? <FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={formSchema}
                grids={2}
                data={referral ? { name: referral.prospectName, status: "active" } : data}
                api={api}
                mode={mode}
                schema={schema}
                method={method}
                extraPayload={referral ? { referral_uuid: referral.uuid } : undefined}
                queryKey={referral ? "companies,platform-referrals" : "companies"}
            />
        </MyDialog>
    );
};

export default CompanyForm;

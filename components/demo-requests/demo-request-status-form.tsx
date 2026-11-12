"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import {
    DemoRequestAdminEditFormSchema,
    DemoRequestRow,
} from "@/components/demo-requests/demo-request-type";
import DemoRequestAdminFormFieldSchema from "@/components/demo-requests/demo-request-admin-form-field-schema";
import FormTrigger from "@/components/form-trigger";

type Props = {
    row: DemoRequestRow;
};

const DemoRequestStatusForm: FC<Props> = ({ row }) => {
    return (
        <MyDialog
            size="3xl"
            title="admin_demo_request.edit_title"
            trigger={<FormTrigger mode="edit" />}
        >
            <FormBuilder
                formSchema={DemoRequestAdminFormFieldSchema()}
                grids={2}
                data={{
                    id: row.id,
                    full_name: row.full_name,
                    isp_name: row.isp_name,
                    email: row.email ?? "",
                    website: row.website ?? "",
                    phone: row.phone,
                    user_count: row.user_count ?? "",
                    whatsapp: row.whatsapp,
                    office_address: row.office_address ?? "",
                    terms_accepted: row.terms_accepted === true,
                    status: row.status,
                    username: row.username ?? "",
                    password: row.password ?? "",
                }}
                api="/demo-requests"
                mode="edit"
                schema={DemoRequestAdminEditFormSchema}
                method="PUT"
                queryKey="demo-requests"
                hydrateOnEdit="never"
                successMessage="admin_demo_request.toast.updated"
            />
        </MyDialog>
    );
};

export default DemoRequestStatusForm;

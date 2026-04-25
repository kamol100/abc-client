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
            size="md"
            title="admin_demo_request.edit_title"
            trigger={<FormTrigger mode="edit" />}
        >
            <FormBuilder
                formSchema={DemoRequestAdminFormFieldSchema()}
                grids={1}
                data={{
                    id: row.id,
                    status: row.status,
                    website: row.website ?? "",
                    phone: row.phone,
                    isp_name: row.isp_name,
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

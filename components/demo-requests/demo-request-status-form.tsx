"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import {
    DemoRequestRow,
    DemoRequestStatusFormSchema,
} from "@/components/demo-requests/demo-request-type";
import DemoRequestStatusFormFieldSchema from "@/components/demo-requests/demo-request-status-form-schema";
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
                formSchema={DemoRequestStatusFormFieldSchema()}
                grids={1}
                data={{ id: row.id, status: row.status }}
                api="/demo-requests"
                mode="edit"
                schema={DemoRequestStatusFormSchema}
                method="PUT"
                queryKey="demo-requests"
                hydrateOnEdit="never"
                successMessage="admin_demo_request.toast.updated"
            />
        </MyDialog>
    );
};

export default DemoRequestStatusForm;

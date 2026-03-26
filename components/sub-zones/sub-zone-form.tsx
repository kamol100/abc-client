"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { SubZoneFormSchema, SubZoneRow } from "@/components/sub-zones/sub-zone-type";
import SubZoneFormFieldSchema from "@/components/sub-zones/sub-zone-form-schema";
import FormTrigger from "@/components/form-trigger";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<SubZoneRow> & { id: number };
};

const SubZoneForm: FC<Props> = ({
    mode = "create",
    api = "/sub-zones",
    method = "POST",
    data = undefined,
}) => {
    return (
        <MyDialog
            size="2xl"
            title={mode === "create" ? "sub_zone.create_title" : "sub_zone.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={SubZoneFormFieldSchema()}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={SubZoneFormSchema}
                method={method}
                queryKey="sub-zones"
            />
        </MyDialog>
    );
};

export default SubZoneForm;

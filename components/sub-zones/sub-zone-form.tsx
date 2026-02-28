"use client";

import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
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
        <DialogWrapper
            size="2xl"
            title={mode === "create" ? "create_sub_zone" : "edit_sub_zone"}
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
        </DialogWrapper>
    );
};

export default SubZoneForm;

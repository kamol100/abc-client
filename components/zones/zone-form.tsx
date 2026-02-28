"use client";

import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { ZoneFormSchema, ZoneRow } from "@/components/zones/zone-type";
import ZoneFormFieldSchema from "@/components/zones/zone-form-schema";
import FormTrigger from "@/components/form-trigger";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<ZoneRow> & { id: number };
};

const ZoneForm: FC<Props> = ({
    mode = "create",
    api = "/zones",
    method = "POST",
    data = undefined,
}) => {
    return (
        <DialogWrapper
            size="xl"
            title={mode === "create" ? "create_zone" : "edit_zone"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={ZoneFormFieldSchema()}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={ZoneFormSchema}
                method={method}
                queryKey="zones"
            />
        </DialogWrapper>
    );
};

export default ZoneForm;

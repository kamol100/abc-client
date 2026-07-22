"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { TjBoxFormSchema, TjBoxRow } from "./tj-box-type";
import TjBoxFormFieldSchema from "./tj-box-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<TjBoxRow> & { id: number };
};

const TjBoxForm: FC<Props> = ({
    mode = "create",
    api = "/tj-boxes",
    method = "POST",
    data = undefined,
}) => {
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "tj_box.create_title" : "tj_box.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={TjBoxFormFieldSchema()}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={TjBoxFormSchema}
                method={method}
                queryKey="tj-boxes"
            />
        </MyDialog>
    );
};

export default TjBoxForm;

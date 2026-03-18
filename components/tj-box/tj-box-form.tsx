"use client";

import { FC, ReactNode } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { GRID_STYLES } from "@/components/form-wrapper/form-builder-type";
import { TjBoxFormSchema, TjBoxRow } from "./tj-box-type";
import TjBoxFormFieldSchema from "./tj-box-form-schema";
import { TjBoxGetLocationRow } from "./tj-box-get-location-row";

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
    const formSchema = TjBoxFormFieldSchema();

    const children: (renderField: (field: import("@/components/form-wrapper/form-builder-type").FormFieldConfig) => ReactNode) => ReactNode =
        (renderField) => (
            <div className={`grid gap-4 m-auto ${GRID_STYLES[2]} w-full`}>
                <div className="col-span-1 sm:col-span-2">
                    <TjBoxGetLocationRow />
                </div>
                {formSchema.map((field) => (
                    <div key={field.name}>
                        {field.permission !== false ? renderField(field) : null}
                    </div>
                ))}
            </div>
        );

    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "tj_box.create_title" : "tj_box.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={formSchema}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={TjBoxFormSchema}
                method={method}
                queryKey="tj-boxes"
                children={children}
            />
        </MyDialog>
    );
};

export default TjBoxForm;

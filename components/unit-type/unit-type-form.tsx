import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { UnitTypeFormSchema, UnitTypeRow } from "./unit-type-type";
import UnitTypeFormFieldSchema from "./unit-type-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<UnitTypeRow> & { id: number };
};

const UnitTypeForm: FC<Props> = ({
    mode = "create",
    api = "/unit-types",
    method = "POST",
    data = undefined,
}) => {
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "unit_type.create_title" : "unit_type.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={UnitTypeFormFieldSchema()}
                grids={1}
                data={data}
                api={api}
                mode={mode}
                schema={UnitTypeFormSchema}
                method={method}
                queryKey="unit-types"
            />
        </MyDialog>
    );
};

export default UnitTypeForm;

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { RoleFormSchema, RoleRow } from "./role-type";
import RoleFormFieldSchema from "./role-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<RoleRow> & { id: number };
};

const RoleForm: FC<Props> = ({
    mode = "create",
    api = "/roles",
    method = "POST",
    data = undefined,
}) => {
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "role.create_title" : "role.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={RoleFormFieldSchema()}
                grids={1}
                data={data}
                api={api}
                mode={mode}
                schema={RoleFormSchema}
                method={method}
                queryKey="roles"
            />
        </MyDialog>
    );
};

export default RoleForm;

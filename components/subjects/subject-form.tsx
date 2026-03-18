import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { SubjectFormSchema, SubjectRow } from "./subject-type";
import SubjectFormFieldSchema from "./subject-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<SubjectRow> & { id: number };
};

const SubjectForm: FC<Props> = ({
    mode = "create",
    api = "/subjects",
    method = "POST",
    data = undefined,
}) => {
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "subject.create_title" : "subject.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={SubjectFormFieldSchema()}
                grids={1}
                data={data}
                api={api}
                mode={mode}
                schema={SubjectFormSchema}
                method={method}
                queryKey="subjects"
            />
        </MyDialog>
    );
};

export default SubjectForm;

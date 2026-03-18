import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { TagFormSchema, TagRow } from "./tag-type";
import TagFormFieldSchema from "./tag-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<TagRow> & { id: number };
};

const TagForm: FC<Props> = ({
    mode = "create",
    api = "/tags",
    method = "POST",
    data = undefined,
}) => {
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "tag.create_title" : "tag.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={TagFormFieldSchema()}
                grids={1}
                data={data}
                api={api}
                mode={mode}
                schema={TagFormSchema}
                method={method}
                queryKey="tags"
            />
        </MyDialog>
    );
};

export default TagForm;

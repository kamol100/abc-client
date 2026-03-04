import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { ExpenseTypeFormSchema, ExpenseTypeRow } from "./expense-type-type";
import ExpenseTypeFormFieldSchema from "./expense-type-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<ExpenseTypeRow> & { id: number };
};

const ExpenseTypeForm: FC<Props> = ({
    mode = "create",
    api = "/expense-types",
    method = "POST",
    data = undefined,
}) => {
    return (
        <DialogWrapper
            size="xl"
            title={mode === "create" ? "expense_type.create_title" : "expense_type.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={ExpenseTypeFormFieldSchema()}
                grids={1}
                data={data}
                api={api}
                mode={mode}
                schema={ExpenseTypeFormSchema}
                method={method}
                queryKey="expense-types"
            />
        </DialogWrapper>
    );
};

export default ExpenseTypeForm;

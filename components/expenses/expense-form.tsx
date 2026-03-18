"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { ExpenseFormSchema, ExpenseRow } from "@/components/expenses/expense-type";
import ExpenseFormFieldSchema from "@/components/expenses/expense-form-schema";
import FormTrigger from "@/components/form-trigger";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<ExpenseRow> & { id: number };
};

const ExpenseForm: FC<Props> = ({
    mode = "create",
    api = "/expenses",
    method = "POST",
    data = undefined,
}) => {
    const formData =
        mode === "create"
            ? ({ expense_date: new Date(), ...(data ?? {}) } as Record<string, unknown>)
            : (data as unknown as Record<string, unknown> | undefined);

    return (
        <MyDialog
            size="3xl"
            title={mode === "create" ? "expense.create_title" : "expense.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={ExpenseFormFieldSchema()}
                grids={2}
                data={formData}
                api={api}
                mode={mode}
                schema={ExpenseFormSchema}
                method={method}
                queryKey="expenses"
            />
        </MyDialog>
    );
};

export default ExpenseForm;

"use client";

import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    expenseFundAccess,
    expenseSubmitSchema,
} from "@/components/expenses/expense-fund-access";
import ExpenseFormFieldSchema from "@/components/expenses/expense-form-schema";
import { ExpenseRow } from "@/components/expenses/expense-type";
import FormBuilder, { VisibleFormField } from "@/components/form-wrapper/form-builder";
import { GRID_STYLES } from "@/components/form-wrapper/form-builder-type";
import FormTrigger from "@/components/form-trigger";
import { MyDialog } from "@/components/my-dialog";
import { usePermissions, useProfile, useSettings } from "@/context/app-provider";
import { cn } from "@/lib/utils";

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
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { profile } = useProfile();
    const { settings } = useSettings();
    const canUpdateFund = hasPermission("expenses.fund.update");
    const canEditExpense = hasPermission("expenses.edit");

    const fundAccess = useMemo(
        () => expenseFundAccess({
            mode,
            roles: settings.roles,
            staff: profile.staff,
            canUpdateFund,
            canEditExpense,
        }),
        [canEditExpense, canUpdateFund, mode, profile.staff, settings.roles],
    );
    const formSchema = ExpenseFormFieldSchema({ mode, fundAccess });
    const schema = useMemo(
        () => expenseSubmitSchema(fundAccess.blockSubmit),
        [fundAccess.blockSubmit],
    );

    const formData =
        mode === "create"
            ? ({ expense_date: new Date(), ...(data ?? {}) } as Record<string, unknown>)
            : (data as unknown as Record<string, unknown> | undefined);

    if (mode === "edit" && !canEditExpense) return null;

    return (
        <MyDialog
            size="3xl"
            title={mode === "create" ? "expense.create_title" : "expense.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={formSchema}
                grids={2}
                data={formData}
                api={api}
                mode={mode}
                schema={schema}
                method={method}
                queryKey="expenses"
            >
                {(renderField) => (
                    <div className={cn("m-auto grid w-full gap-4", GRID_STYLES[2])}>
                        {formSchema.map((field) => (
                            <VisibleFormField key={field.name} field={field}>
                                {renderField(field)}
                                {field.name === "fund_id" && fundAccess.showUnassignedWarning ? (
                                    <p role="alert" className="mt-1 text-sm text-destructive">
                                        {t("expense.fund.errors.no_access")}
                                    </p>
                                ) : null}
                            </VisibleFormField>
                        ))}
                    </div>
                )}
            </FormBuilder>
        </MyDialog>
    );
};

export default ExpenseForm;

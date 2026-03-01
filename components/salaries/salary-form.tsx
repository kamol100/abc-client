"use client";

import { useFetch } from "@/app/actions";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FC, ReactNode, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormBuilder from "../form-wrapper/form-builder";
import { FormFieldConfig } from "../form-wrapper/form-builder-type";
import SalaryFormFieldSchema from "./salary-form-schema";
import {
  SalaryDeduction,
  SalaryFormSchema,
  SalaryItem,
  SalaryStructure,
} from "./salary-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Record<string, unknown>;
};

type ContentProps = {
  formSchema: FormFieldConfig[];
  renderField: (field: FormFieldConfig) => ReactNode;
  mode: string;
};

const SalaryFormContent: FC<ContentProps> = ({
  formSchema,
  renderField,
  mode,
}) => {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();

  const salaryType: string = watch("salary_type") ?? "monthly";
  const staffId: number | undefined = watch("staff_id");
  const salaryItems: SalaryItem[] = watch("salary_items") ?? [];
  const salaryDeductions: SalaryDeduction[] =
    watch("salary_deductions") ?? [];

  const fieldMap = useMemo(() => {
    const map = new Map<string, FormFieldConfig>();
    for (const f of formSchema) map.set(f.name, f);
    return map;
  }, [formSchema]);

  const field = (name: string) => {
    const config = fieldMap.get(name);
    return config ? renderField(config) : null;
  };

  const { data: staffSalary } = useQuery<SalaryStructure>({
    queryKey: ["staff-salary-structure", staffId],
    queryFn: async () => {
      const result = await useFetch({
        url: `/salary-deduction/${staffId}`,
      });
      if (!result?.success) throw new Error("Failed to fetch salary structure");
      return result.data as SalaryStructure;
    },
    enabled: !!staffId && salaryType === "monthly" && mode === "create",
    retry: 1,
  });

  useEffect(() => {
    if (!staffSalary || mode !== "create") return;
    setValue("salary_items", staffSalary.salary_items ?? []);
    setValue("salary_deductions", staffSalary.salary_deductions ?? []);
    setValue("amount", staffSalary.total_salary ?? 0);
  }, [staffSalary, mode, setValue]);

  const totalItems = useMemo(
    () =>
      salaryItems.reduce(
        (acc, item) => acc + toNumber(item.items_value),
        0,
      ),
    [salaryItems],
  );

  const totalDeductions = useMemo(
    () =>
      salaryDeductions.reduce(
        (acc, item) => acc + toNumber(item.deductions_value),
        0,
      ),
    [salaryDeductions],
  );

  const netSalary = totalItems - totalDeductions;

  useEffect(() => {
    if (salaryType === "monthly") {
      setValue("amount", netSalary);
    }
  }, [netSalary, salaryType, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("salary_type")}
        {field("fund_id")}
        {field("staff_id")}
        {field("date")}
        {field("status")}
        {salaryType === "advance" && field("amount")}
      </div>

      {salaryType === "monthly" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>{field("salary_items")}</div>
            <div>{field("salary_deductions")}</div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("gross_amount")}:
              </span>
              <span className="font-medium">
                ৳{formatMoney(totalItems)}
              </span>
            </div>
            {totalDeductions > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("total_deductions")}:
                </span>
                <span className="font-medium text-destructive">
                  -৳{formatMoney(totalDeductions)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">{t("net_salary")}:</span>
              <span className="font-bold text-primary text-lg">
                ৳{formatMoney(netSalary)}
              </span>
            </div>
          </div>
        </>
      )}

      <div>{field("note")}</div>
    </div>
  );
};

const SalaryForm: FC<Props> = ({
  mode = "create",
  api = "/salaries",
  method = "POST",
  data,
}) => {
  const router = useRouter();
  const formSchema = SalaryFormFieldSchema();

  return (
    <div className="w-full md:w-3/4 mx-auto flex flex-col flex-1 min-h-0">
      <FormBuilder
        formSchema={formSchema}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={SalaryFormSchema}
        method={method}
        queryKey="salaries"
        fullPage
        actionButtonClass="justify-center"
        onClose={() => router.push("/salaries")}
      >
        {(renderField) => (
          <SalaryFormContent
            formSchema={formSchema}
            renderField={renderField}
            mode={mode}
          />
        )}
      </FormBuilder>
    </div>
  );
};

export default SalaryForm;

"use client";

import { useFetch } from "@/app/actions";
import { parseApiError, toNumber } from "@/lib/helper/helper";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FC, ReactNode, useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import FormBuilder from "../form-wrapper/form-builder";
import { FormFieldConfig } from "../form-wrapper/form-builder-type";
import { Skeleton } from "../ui/skeleton";
import SalaryFormFieldSchema from "./salary-form-schema";
import {
  SalaryDeduction,
  SalaryFormSchema,
  SalaryItem,
  SalaryStructure,
} from "./salary-type";
import DisplayCount from "../display-count";

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

type SalaryStructureResponse = {
  success?: boolean;
  data?: unknown;
  message?: string;
};

const normalizeSalaryStructure = (response: unknown): SalaryStructure | null => {
  if (!response || typeof response !== "object") return null;

  const parsedResponse = response as SalaryStructureResponse;
  if (parsedResponse.success === false) {
    throw new Error(parsedResponse.message || "Failed to fetch salary structure");
  }

  const payload =
    parsedResponse.data !== undefined
      ? parsedResponse.data
      : parsedResponse;

  if (!payload || typeof payload !== "object") return null;

  const structure = payload as Partial<SalaryStructure>;
  const salaryItems = Array.isArray(structure.salary_items) ? structure.salary_items : [];
  const salaryDeductions = Array.isArray(structure.salary_deductions)
    ? structure.salary_deductions
    : [];
  const totalSalary = toNumber(structure.total_salary);
  const advance = toNumber(structure.advance);

  const hasPredefinedStructure =
    salaryItems.length > 0 || salaryDeductions.length > 0 || totalSalary > 0 || advance > 0;

  if (!hasPredefinedStructure) return null;

  return {
    salary_items: salaryItems,
    salary_deductions: salaryDeductions,
    total_salary: totalSalary,
    advance,
  };
};

const SalaryStructureSkeleton: FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
};

const SalaryFormContent: FC<ContentProps> = ({
  formSchema,
  renderField,
  mode,
}) => {
  const { t } = useTranslation();
  const { control, watch, setValue } = useFormContext();

  const salaryType: string = watch("salary_type") ?? "monthly";
  const staffIdValue = toNumber(watch("staff_id"));
  const staffId = staffIdValue > 0 ? staffIdValue : undefined;
  const salaryItems = (useWatch({
    control,
    name: "salary_items",
  }) as SalaryItem[] | undefined) ?? [];
  const salaryDeductions = (useWatch({
    control,
    name: "salary_deductions",
  }) as SalaryDeduction[] | undefined) ?? [];

  const fieldMap = useMemo(() => {
    const map = new Map<string, FormFieldConfig>();
    for (const f of formSchema) map.set(f.name, f);
    return map;
  }, [formSchema]);

  const field = (name: string) => {
    const config = fieldMap.get(name);
    return config ? renderField(config) : null;
  };

  const {
    data: staffSalary,
    error: salaryStructureError,
    isFetching: isSalaryStructureLoading,
  } = useQuery<SalaryStructure | null>({
    queryKey: ["staff-salary-structure", staffId],
    queryFn: async () => {
      const result = await useFetch({
        url: `/salary-deduction/${staffId}`,
      });
      return normalizeSalaryStructure(result);
    },
    enabled: !!staffId && salaryType === "monthly" && mode === "create",
    retry: 0,
    refetchOnWindowFocus: false,
  });
  const showSalaryStructureSkeleton =
    mode === "create" && salaryType === "monthly" && !!staffId && isSalaryStructureLoading;

  useEffect(() => {
    if (!salaryStructureError) return;
    toast.error(
      parseApiError(salaryStructureError) || "Failed to load salary structure for the selected staff."
    );
  }, [salaryStructureError]);

  useEffect(() => {
    if (mode !== "create" || salaryType !== "monthly") return;

    if (!staffId) {
      setValue("salary_items", []);
      setValue("salary_deductions", []);
      setValue("amount", 0);
      return;
    }

    if (isSalaryStructureLoading) return;

    if (!staffSalary) {
      setValue("salary_items", []);
      setValue("salary_deductions", []);
      setValue("amount", 0);
      return;
    }

    setValue("salary_items", staffSalary.salary_items ?? []);
    setValue("salary_deductions", staffSalary.salary_deductions ?? []);
    setValue("amount", staffSalary.total_salary ?? 0);
  }, [staffId, staffSalary, isSalaryStructureLoading, mode, salaryType, setValue]);

  const totalItems = salaryItems.reduce((acc, item) => acc + toNumber(item.items_value), 0);

  const totalDeductions = salaryDeductions.reduce((acc, item) => acc + toNumber(item.deductions_value), 0);

  const netSalary = totalItems - totalDeductions;

  useEffect(() => {
    if (salaryType === "monthly") {
      setValue("amount", netSalary, { shouldDirty: true, shouldValidate: true });
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
          {showSalaryStructureSkeleton ? (
            <SalaryStructureSkeleton />
          ) : (
            <>
              {staffId && !staffSalary && !salaryStructureError && (
                <p className="text-sm text-muted-foreground">
                  No predefined salary structure found for this staff. You can add salary items and deductions manually.
                </p>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>{field("salary_items")}</div>
                <div>{field("salary_deductions")}</div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("common.gross_amount")}:
                  </span>
                  <span className="font-medium">
                    <DisplayCount amount={toNumber(totalItems)} formatCurrency />
                  </span>
                </div>
                {totalDeductions > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("common.total_deductions")}:
                    </span>
                    <span className="font-medium text-destructive">
                      <DisplayCount amount={toNumber(totalDeductions)} formatCurrency />
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">{t("common.net_salary")}:</span>
                  <span className="font-bold text-primary text-lg">
                    <DisplayCount amount={toNumber(netSalary)} formatCurrency />
                  </span>
                </div>
              </div>
            </>
          )}
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
      <div className="ml-1 pr-3">
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
    </div>
  );
};

export default SalaryForm;

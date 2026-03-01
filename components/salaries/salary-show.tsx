"use client";

import { formatMoney, toNumber } from "@/lib/helper/helper";
import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ActionButton from "../action-button";
import { DialogWrapper } from "../dialog-wrapper";
import { Badge } from "../ui/badge";
import { SalaryRow } from "./salary-type";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
  pending:
    "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400",
  approved:
    "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
  repay:
    "bg-violet-600/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
  cancelled:
    "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

const TYPE_STYLES: Record<string, string> = {
  monthly:
    "bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
  advance:
    "bg-orange-600/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
};

type Props = {
  salary: SalaryRow;
};

const SalaryShow: FC<Props> = ({ salary }) => {
  const { t } = useTranslation();

  const items = salary.salary_items ?? [];
  const deductions = salary.salary_deductions ?? [];

  const totalItems = useMemo(
    () => items.reduce((acc, i) => acc + toNumber(i.items_value), 0),
    [items],
  );

  const totalDeductions = useMemo(
    () => deductions.reduce((acc, d) => acc + toNumber(d.deductions_value), 0),
    [deductions],
  );

  return (
    <DialogWrapper
      trigger={<ActionButton action="search" />}
      title="salary_details"
      size="2xl"
    >
      <div className="space-y-5">
        {/* Header badges */}
        <div className="flex items-center gap-2">
          <Badge className={TYPE_STYLES[salary.salary_type] ?? ""}>
            {salary.salary_type}
          </Badge>
          <Badge className={STATUS_STYLES[salary.status] ?? ""}>
            {salary.status}
          </Badge>
        </div>

        {/* Payment information */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="font-semibold mb-3">{salary.staff?.name}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t("date")}</span>
              <p className="font-medium">{salary.date || "N/A"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("total_amount")}</span>
              <p className="text-xl font-bold text-primary">
                ৳{formatMoney(salary.amount)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t("payment_method")}
              </span>
              <p className="font-medium">{salary.fund?.name || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Salary Items */}
        {items.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t("salary_and_allowance")}</h4>
            <div className="rounded-lg border divide-y">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-4 py-2.5 text-sm"
                >
                  <span>{item.items_label}</span>
                  <span className="font-medium">
                    ৳{formatMoney(item.items_value)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-2.5 bg-muted/50 font-semibold text-sm">
                <span>{t("total")}</span>
                <span>৳{formatMoney(totalItems)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Salary Deductions */}
        {deductions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t("salary_deductions")}</h4>
            <div className="rounded-lg border divide-y">
              {deductions.map((d, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-4 py-2.5 text-sm"
                >
                  <span>{d.deductions_label}</span>
                  <span className="font-medium text-destructive">
                    -৳{formatMoney(d.deductions_value)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-2.5 bg-muted/50 font-semibold text-sm">
                <span>{t("total")}</span>
                <span className="text-destructive">
                  -৳{formatMoney(totalDeductions)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Net Amount */}
        {(items.length > 0 || deductions.length > 0) && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="space-y-1 text-sm">
              {items.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("gross_amount")}:
                  </span>
                  <span>৳{formatMoney(totalItems)}</span>
                </div>
              )}
              {deductions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("total_deductions")}:
                  </span>
                  <span className="text-destructive">
                    -৳{formatMoney(totalDeductions)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-semibold">{t("net_salary")}:</span>
                <span className="font-bold text-primary text-lg">
                  ৳{formatMoney(salary.amount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        {salary.note && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t("note")}</h4>
            <p className="text-sm text-muted-foreground rounded-lg border p-3">
              {salary.note}
            </p>
          </div>
        )}
      </div>
    </DialogWrapper>
  );
};

export default SalaryShow;

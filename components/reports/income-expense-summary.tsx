"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKey, formatMoney } from "@/lib/helper/helper";

type IncomeExpenseSummaryProps = {
    titleKey: string;
    entries: Array<[string, number]>;
    total: number;
    isLoading?: boolean;
};

const IncomeExpenseSummary: FC<IncomeExpenseSummaryProps> = ({
    titleKey,
    entries,
    total,
    isLoading = false,
}) => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                    <p className="text-sm font-medium">{t(titleKey)}</p>
                    <p className="text-sm text-muted-foreground">{t("income_expense.columns.amount")}</p>
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ) : entries.length ? (
                    <div className="space-y-2">
                        {entries.map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between gap-3 text-sm">
                                <p className="text-muted-foreground">
                                    {t(`income_expense.types.${key}`, {
                                        defaultValue: formatKey(key),
                                    })}
                                </p>
                                <p className="font-medium">৳{formatMoney(value)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">{t("income_expense.empty")}</p>
                )}

                <div className="flex items-center justify-between border-t pt-3">
                    <p className="font-semibold">{t("common.total")}</p>
                    <p className="font-semibold text-primary">৳{formatMoney(total)}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default IncomeExpenseSummary;

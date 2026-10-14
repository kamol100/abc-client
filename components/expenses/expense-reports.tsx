"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Card from "@/components/card";
import DisplayCount from "@/components/display-count";
import { toNumber } from "@/lib/helper/helper";
import { ExpenseReports as ExpenseReportsType } from "@/components/expenses/expense-type";

type Props = {
    reports?: ExpenseReportsType | null;
    isLoading?: boolean;
};

const ExpenseReports: FC<Props> = ({ reports, isLoading = false }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return <Skeleton className="h-20 w-full" />;
    }

    return (
        <Card>
            <CardContent className="p-3 flex justify-between gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">
                        {t("expense.reports.total")}
                    </p>
                    <p className="font-semibold">
                        <DisplayCount
                            amount={toNumber(reports?.total_amount)}
                            formatCurrency
                            currency="BDT"
                            className="text-xs md:text-md lg:text-md font-semibold"
                            animate
                            duration={800}
                        />
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                        {t("expense.reports.pending")}
                    </p>
                    <p className="font-semibold">
                        <DisplayCount
                            amount={toNumber(reports?.pending_amount)}
                            formatCurrency
                            currency="BDT"
                            className="text-xs md:text-md lg:text-md font-semibold"
                            animate
                            duration={800}
                        />
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default ExpenseReports;

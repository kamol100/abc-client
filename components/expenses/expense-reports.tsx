"use client";

import { FC } from "react";
import { Clock, Receipt } from "lucide-react";
import SummaryChip from "@/components/summary-chip";
import { toNumber } from "@/lib/helper/helper";
import { ExpenseReports as ExpenseReportsType } from "@/components/expenses/expense-type";

type Props = {
    reports?: ExpenseReportsType | null;
    isLoading?: boolean;
};

/** Expense totals as chips, for the table toolbar's center. Phones: two side by side. */
const ExpenseReports: FC<Props> = ({ reports, isLoading = false }) => (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-center">
        <SummaryChip
            icon={Receipt}
            label="expense.reports.total"
            amount={toNumber(reports?.total_amount)}
            isLoading={isLoading}
            currency="BDT"
            stack
        />
        <SummaryChip
            icon={Clock}
            label="expense.reports.pending"
            amount={toNumber(reports?.pending_amount)}
            isLoading={isLoading}
            currency="BDT"
            stack
        />
    </div>
);

export default ExpenseReports;

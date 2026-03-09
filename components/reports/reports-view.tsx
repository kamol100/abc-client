"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { CardContent } from "@/components/ui/card";

const REPORT_LINKS = [
    { href: "/reports/income-expense", titleKey: "menu.reports.income_expense.title" },
    { href: "/reports/funds", titleKey: "menu.reports.funds.title" },
    { href: "/reports/invoices", titleKey: "menu.reports.invoices.title" },
    { href: "/reports/payments", titleKey: "menu.reports.payments.title" },
    { href: "/reports/expenses", titleKey: "menu.reports.expenses.title" },
    { href: "/reports/product-in", titleKey: "menu.reports.product_in.title" },
    { href: "/reports/product-out", titleKey: "menu.reports.product_out.title" },
] as const;

const ReportsView = () => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {REPORT_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="block">
                    <Card className="transition-colors hover:border-primary/50">
                        <CardContent className="p-4">
                            <p className="font-medium">{t(item.titleKey)}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export default ReportsView;

import { Metadata } from "next";
import ExpenseTypeTable from "@/components/expense-type/expense-type-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("expense_type.title_plural"),
};

export default function ExpenseTypesPage() {
    return <ExpenseTypeTable />;
}

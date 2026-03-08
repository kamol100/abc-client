import { Metadata } from "next";
import ProductReportsTable from "@/components/products/product-reports-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.product_out.title"),
};

export default function ProductOutReportsPage() {
    return (
        <ProductReportsTable
            mode="out"
            toolbarTitleKey="menu.reports.product_out.title"
        />
    );
}

import { Metadata } from "next";
import ProductReportsTable from "@/components/products/product-reports-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.product_in.title"),
};

export default function ProductInReportsPage() {
    return (
        <ProductReportsTable
            mode="in"
            toolbarTitleKey="menu.reports.product_in.title"
        />
    );
}

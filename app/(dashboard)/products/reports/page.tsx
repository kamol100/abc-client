import { Metadata } from "next";
import ProductReportsView from "@/components/products/product-reports-view";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.products.reports.title"),
};

export default function ProductsReportsPage() {
    return <ProductReportsView />;
}

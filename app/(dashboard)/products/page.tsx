import { Metadata } from "next";
import ProductTable from "@/components/products/product-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("product.title_plural"),
};

export default function ProductsPage() {
    return <ProductTable />;
}

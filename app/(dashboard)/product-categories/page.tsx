import { Metadata } from "next";
import ProductCategoryTable from "@/components/product-category/product-category-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("product_category.title_plural"),
};

export default function ProductCategoriesPage() {
    return <ProductCategoryTable />;
}

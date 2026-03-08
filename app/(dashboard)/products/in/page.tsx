import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ProductInForm from "@/components/products/product-in-form";

export const metadata: Metadata = {
    title: t("product_in.title"),
    description: t("product_in.create_title"),
};

export default function ProductInPage() {
    return <ProductInForm />;
}

import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ProductOutForm from "@/components/products/product-out-form";

export const metadata: Metadata = {
    title: t("product_out.title"),
    description: t("product_out.create_title"),
};

export default function ProductOutPage() {
    return <ProductOutForm />;
}

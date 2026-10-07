import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ProductInForm from "@/components/products/product-in-form";

type Props = {
    searchParams: Promise<{ product_id?: string }>;
};

export const metadata: Metadata = {
    title: t("product_in.title"),
    description: t("product_in.create_title"),
};

export default async function ProductInPage({ searchParams }: Props) {
    const { product_id } = await searchParams;
    return <ProductInForm productId={product_id} />;
}

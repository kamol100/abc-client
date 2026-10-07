import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ProductOutForm from "@/components/products/product-out-form";

type Props = {
    searchParams: Promise<{ product_id?: string }>;
};

export const metadata: Metadata = {
    title: t("product_out.title"),
    description: t("product_out.create_title"),
};

export default async function ProductOutPage({ searchParams }: Props) {
    const { product_id } = await searchParams;
    return <ProductOutForm productId={product_id} />;
}

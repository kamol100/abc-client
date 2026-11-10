import { Metadata } from "next";
import ProductMovementTable from "@/components/products/product-movement-table";
import { t } from "@/lib/i18n/server";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("product_movement.in_details_title"),
};

export default async function ProductInDetailsPage({ params }: Props) {
    const { id } = await params;

    return (
        <ProductMovementTable
            mode="in"
            productId={id}
            backUrl="/products"
            leading={
                <h1 className="text-xl font-semibold">
                    {t("product_movement.in_details_title")}
                </h1>
            }
        />
    );
}

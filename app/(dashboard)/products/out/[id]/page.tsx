import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import MyButton from "@/components/my-button";
import ProductMovementTable from "@/components/products/product-movement-table";
import { t } from "@/lib/i18n/server";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("product_movement.out_details_title"),
};

export default async function ProductOutDetailsPage({ params }: Props) {
    const { id } = await params;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-xl font-semibold">
                    {t("product_movement.out_details_title")}
                </h1>
                <MyButton action="cancel" variant="outline" size="default" url="/products">
                    <ArrowLeft className="h-4 w-4" />
                    <span>{t("product_movement.actions.back_to_products")}</span>
                </MyButton>
            </div>
            <ProductMovementTable mode="out" productId={id} />
        </div>
    );
}

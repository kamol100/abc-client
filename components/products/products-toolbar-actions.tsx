"use client";

import { FC } from "react";
import { PackageMinus, PackagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import MyButton from "@/components/my-button";
import ProductForm from "@/components/products/product-form";

/** Product in and out links, shown in the center of the products toolbar. */
export const ProductMovementButtons: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    const canProductIn = hasPermission("products-in.create");
    const canProductOut = hasPermission("products-out.create");

    if (!canProductIn && !canProductOut) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {canProductIn && (
                <MyButton
                    size="default"
                    variant="outline"
                    url="/products/in"
                    className="max-md:w-9 max-md:px-0"
                    aria-label={t("product_in.title")}
                    tooltip="product_in.title"
                >
                    <PackagePlus />
                    <span className="hidden md:inline">{t("product_in.title")}</span>
                </MyButton>
            )}
            {canProductOut && (
                <MyButton
                    size="default"
                    variant="outline"
                    url="/products/out"
                    className="max-md:w-9 max-md:px-0"
                    aria-label={t("product_out.title")}
                    tooltip="product_out.title"
                >
                    <PackageMinus />
                    <span className="hidden md:inline">{t("product_out.title")}</span>
                </MyButton>
            )}
        </div>
    );
};

/** The add slot, after the filter button: the create-product dialog. */
const ProductsToolbarActions: FC = () => {
    const { hasPermission } = usePermissions();

    return hasPermission("products.create") ? <ProductForm /> : null;
};

export default ProductsToolbarActions;

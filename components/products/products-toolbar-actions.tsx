"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import ActionButton from "@/components/action-button";
import ProductForm from "@/components/products/product-form";

const ProductsToolbarActions: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    const canCreateProduct = hasPermission("products.create");
    const canCreateIn = hasPermission("products-in.create");
    const canCreateOut = hasPermission("products-out.create");
    const canViewReports = hasPermission("products-in.report");

    if (!canCreateProduct && !canCreateIn && !canCreateOut && !canViewReports) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {canCreateIn && (
                <ActionButton
                    action="create"
                    variant="outline"
                    size="sm"
                    url="/products/in"
                    title={t("product_in.title")}
                />
            )}
            {canCreateOut && (
                <ActionButton
                    action="create"
                    variant="outline"
                    size="sm"
                    url="/products/out"
                    title={t("product_out.title")}
                />
            )}
            {canViewReports && (
                <ActionButton
                    action="create"
                    icon={false}
                    variant="outline"
                    size="sm"
                    url="/products/reports"
                    title={t("menu.products.reports.title")}
                />
            )}
            {canCreateProduct && <ProductForm />}
        </div>
    );
};

export default ProductsToolbarActions;

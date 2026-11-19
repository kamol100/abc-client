"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import MyButton from "@/components/my-button";
import ProductReportsTable from "@/components/products/product-reports-table";
import type { ProductMovementMode } from "@/components/products/product-movement-filter-schema";

const ProductReportsView = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const canViewIn = hasPermission("products-in.report");
    const canViewOut = hasPermission("products-out.report");
    const [mode, setMode] = useState<ProductMovementMode>(canViewIn ? "in" : "out");

    return (
        <ProductReportsTable
            key={mode}
            mode={mode}
            toolbarTitleKey="menu.products.reports.title"
            header={
                <div className="flex items-center gap-2">
                    {canViewIn && <MyButton
                        action="create"
                        icon={false}
                        variant={mode === "in" ? "default" : "outline"}
                        size="default"
                        onClick={() => setMode("in")}
                        title={t("product_reports.toggle.in")}
                    />}
                    {canViewOut && <MyButton
                        action="create"
                        icon={false}
                        variant={mode === "out" ? "default" : "outline"}
                        size="default"
                        onClick={() => setMode("out")}
                        title={t("product_reports.toggle.out")}
                    />}
                </div>
            }
        />
    );
};

export default ProductReportsView;

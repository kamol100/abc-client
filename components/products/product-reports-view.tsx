"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import ActionButton from "@/components/action-button";
import ProductReportsTable from "@/components/products/product-reports-table";
import type { ProductMovementMode } from "@/components/products/product-movement-filter-schema";

const ProductReportsView = () => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<ProductMovementMode>("in");

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ActionButton
                    action="create"
                    icon={false}
                    variant={mode === "in" ? "default" : "outline"}
                    size="default"
                    onClick={() => setMode("in")}
                    title={t("product_reports.toggle.in")}
                />
                <ActionButton
                    action="create"
                    icon={false}
                    variant={mode === "out" ? "default" : "outline"}
                    size="default"
                    onClick={() => setMode("out")}
                    title={t("product_reports.toggle.out")}
                />
            </div>

            <ProductReportsTable
                mode={mode}
                toolbarTitleKey="menu.products.reports.title"
            />
        </div>
    );
};

export default ProductReportsView;

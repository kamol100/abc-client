"use client";

import { FC } from "react";
import { usePermissions } from "@/context/app-provider";
import ProductForm from "@/components/products/product-form";

const ProductsToolbarActions: FC = () => {
    const { hasPermission } = usePermissions();

    const canCreateProduct = hasPermission("products.create");
    return (
        <div className="flex items-center gap-2">
            {canCreateProduct && <ProductForm />}
        </div>
    );
};

export default ProductsToolbarActions;

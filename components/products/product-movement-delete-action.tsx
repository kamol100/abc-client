"use client";

import { FC } from "react";
import { usePermissions } from "@/context/app-provider";
import { DeleteModal } from "@/components/delete-modal";
import type { ProductMovementMode } from "@/components/products/product-movement-filter-schema";

/**
 * Deleting a stock-out gives its quantity back to the stock-in lot, so both
 * movement lists, both reports and the product list are refreshed.
 */
export const PRODUCT_MOVEMENT_INVALIDATE_KEYS =
    "products,products-in,products-out,products-in-reports,products-out-reports";

export const productMovementDeletePermission = (mode: ProductMovementMode) =>
    mode === "in" ? "products-in.delete" : "products-out.delete";

type ProductMovementDeleteActionProps = {
    mode: ProductMovementMode;
    id: string;
};

const ProductMovementDeleteAction: FC<ProductMovementDeleteActionProps> = ({ mode, id }) => {
    const { hasPermission } = usePermissions();
    if (!hasPermission(productMovementDeletePermission(mode))) return null;

    return (
        <div className="flex justify-end mr-2">
            <DeleteModal
                api_url={`${mode === "in" ? "/products-in" : "/products-out"}/${id}`}
                keys={PRODUCT_MOVEMENT_INVALIDATE_KEYS}
                confirmMessage={
                    mode === "in"
                        ? "product_movement.actions.delete_in_confirmation"
                        : "product_movement.actions.delete_out_confirmation"
                }
                buttonText="common.confirm_delete"
                withReason
            />
        </div>
    );
};

export default ProductMovementDeleteAction;

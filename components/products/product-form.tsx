"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import ProductFormFieldSchema from "@/components/products/product-form-schema";
import { ProductFormSchema, ProductRow } from "@/components/products/product-type";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<ProductRow> & { id: string };
};

const ProductForm: FC<Props> = ({
    mode = "create",
    api = "/products",
    method = "POST",
    data = undefined,
}) => {
    const { t } = useTranslation();
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "product.create_title" : "product.edit_title"}
            trigger={<FormTrigger mode={mode} aria-label={t(mode === "create" ? "product.create_title" : "product.edit_title")} />}
        >
            <FormBuilder
                preventDuplicateSubmit
                formSchema={ProductFormFieldSchema()}
                grids={1}
                data={data}
                api={api}
                mode={mode}
                schema={ProductFormSchema}
                method={method}
                queryKey="products"
            />
        </MyDialog>
    );
};

export default ProductForm;

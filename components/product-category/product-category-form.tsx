import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { ProductCategoryFormSchema, ProductCategoryRow } from "./product-category-type";
import ProductCategoryFormFieldSchema from "./product-category-form-schema";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<ProductCategoryRow> & { id: number };
};

const ProductCategoryForm: FC<Props> = ({
    mode = "create",
    api = "/product-categories",
    method = "POST",
    data = undefined,
}) => {
    return (
        <MyDialog
            size="xl"
            title={mode === "create" ? "product_category.create_title" : "product_category.edit_title"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={ProductCategoryFormFieldSchema()}
                grids={1}
                data={data}
                api={api}
                mode={mode}
                schema={ProductCategoryFormSchema}
                method={method}
                queryKey="product-categories"
            />
        </MyDialog>
    );
};

export default ProductCategoryForm;

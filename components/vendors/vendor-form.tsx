"use client";

import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { VendorFormSchema, VendorRow } from "@/components/vendors/vendor-type";
import VendorFormFieldSchema from "@/components/vendors/vendor-form-schema";
import FormTrigger from "@/components/form-trigger";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Partial<VendorRow> & { id: number };
};

const VendorForm: FC<Props> = ({
    mode = "create",
    api = "/vendors",
    method = "POST",
    data = undefined,
}) => {
    return (
        <DialogWrapper
            size="xl"
            title={mode === "create" ? "create_vendor" : "edit_vendor"}
            trigger={<FormTrigger mode={mode} />}
        >
            <FormBuilder
                formSchema={VendorFormFieldSchema()}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={VendorFormSchema}
                method={method}
                queryKey="vendors"
            />
        </DialogWrapper>
    );
};

export default VendorForm;

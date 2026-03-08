"use client";

import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import MikrotikPackageFormFieldSchema from "@/components/mikrotik-packages/mikrotik-package-form-schema";
import {
  MikrotikPackageFormSchema,
  MikrotikPackageRow,
} from "@/components/mikrotik-packages/mikrotik-package-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<MikrotikPackageRow> & { id: number };
};

const MikrotikPackageForm: FC<Props> = ({
  mode = "create",
  api = "mikrotik-packages",
  method = "POST",
  data = undefined,
}) => {
  return (
    <DialogWrapper
      size="xl"
      title={
        mode === "create"
          ? "mikrotik_package.create_title"
          : "mikrotik_package.edit_title"
      }
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={MikrotikPackageFormFieldSchema()}
        grids={1}
        data={data}
        api={api}
        mode={mode}
        schema={MikrotikPackageFormSchema}
        method={method}
        queryKey="mikrotik-packages"
      />
    </DialogWrapper>
  );
};

export default MikrotikPackageForm;

import { FC } from "react";
import { DialogWrapper } from "@/components/dialog-wrapper";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import {
  DeviceTypeFormSchema,
  type DeviceTypeRow,
} from "./device-type-type";
import DeviceTypeFormFieldSchema from "./device-type-form-schema";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<DeviceTypeRow> & { id?: number };
};

const DeviceTypeForm: FC<Props> = ({
  mode = "create",
  api = "/device-types",
  method = "POST",
  data = undefined,
}) => {
  return (
    <DialogWrapper
      size="xl"
      title={
        mode === "create"
          ? "device_type.create_title"
          : "device_type.edit_title"
      }
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={DeviceTypeFormFieldSchema()}
        grids={1}
        data={data}
        api={api}
        mode={mode}
        schema={DeviceTypeFormSchema}
        method={method}
        queryKey="device-types"
      />
    </DialogWrapper>
  );
};

export default DeviceTypeForm;

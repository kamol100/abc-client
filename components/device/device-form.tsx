import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import DeviceFormFieldSchema from "./device-form-schema";
import { DeviceFormSchema, DeviceRow } from "./device-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<DeviceRow> & { id: number };
};

const DeviceForm: FC<Props> = ({
  mode = "create",
  api = "/devices",
  method = "POST",
  data = undefined,
}) => {
  return (
    <MyDialog
      size="4xl"
      title={mode === "create" ? "device.create_title" : "device.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={DeviceFormFieldSchema()}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={DeviceFormSchema}
        method={method}
        queryKey="devices"
      />
    </MyDialog>
  );
};

export default DeviceForm;

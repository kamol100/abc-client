import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import DeviceFormFieldSchema from "./device-form-schema";
import { DeviceFormSchema, DeviceRow } from "./device-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";

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
  const { hasPermission } = usePermissions();
  const withOltAccess = mode === "create" && hasPermission("olts.access-settings");
  const { data: types } = useApiQuery<ApiResponse<{ id: number; category: string }[]>>({
    queryKey: ["dropdown-device-types"],
    url: "dropdown-device-types",
    pagination: false,
    enabled: withOltAccess,
  });
  const oltTypeIds = withOltAccess ? (types?.data ?? []).filter((type) => type.category === "olt").map((type) => type.id) : [];

  return (
    <MyDialog
      size="4xl"
      title={mode === "create" ? "device.create_title" : "device.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={DeviceFormFieldSchema(oltTypeIds)}
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

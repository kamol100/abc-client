import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import DeviceFormFieldSchema from "./device-form-schema";
import { DeviceFormSchema, DeviceRow } from "./device-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useTranslation } from "react-i18next";
import { offerOltConnectionTest, savedOltAccess } from "@/components/olt/olt-test-offer";

const CREATE_DEFAULTS = { monitor_enabled: true };

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
  const withOltAccess = hasPermission("olts.access-settings");
  const { data: types } = useApiQuery<ApiResponse<{ id: number; category: string }[]>>({
    queryKey: ["dropdown-device-types"],
    url: "dropdown-device-types",
    pagination: false,
    enabled: withOltAccess,
  });
  const oltTypeIds = withOltAccess ? (types?.data ?? []).filter((type) => type.category === "olt").map((type) => type.id) : [];
  const { t } = useTranslation();
  // OLT saved with SNMP/CLI access: offer "Test connection" (it runs on the OLT page).
  const canTestOlt = withOltAccess && hasPermission("olts.access-test");
  const onSaved = (response: Record<string, unknown> | undefined, payload: Record<string, unknown>) => {
    if (typeof response?.id === "string" && savedOltAccess(payload, oltTypeIds)) {
      offerOltConnectionTest(response.id, { message: t("olt.test.offer"), button: t("olt.test.button") });
    }
  };

  return (
    <MyDialog
      size="4xl"
      title={mode === "create" ? "device.create_title" : "device.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={DeviceFormFieldSchema(oltTypeIds, mode === "edit")}
        grids={2}
        data={mode === "create" ? CREATE_DEFAULTS : data}
        api={api}
        mode={mode}
        schema={DeviceFormSchema}
        method={method}
        queryKey="devices"
        onSuccess={canTestOlt ? onSaved : undefined}
      />
    </MyDialog>
  );
};

export default DeviceForm;

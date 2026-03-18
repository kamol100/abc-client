import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import NetworkFormFieldSchema from "./network-form-schema";
import { NetworkFormSchema, NetworkRow } from "./network-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<NetworkRow> & { id: number };
};

const NetworkForm: FC<Props> = ({
  mode = "create",
  api = "/networks",
  method = "POST",
  data = undefined,
}) => {
  return (
    <MyDialog
      size="3xl"
      title={mode === "create" ? "network.create_title" : "network.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={NetworkFormFieldSchema()}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={NetworkFormSchema}
        method={method}
        queryKey="networks"
      />
    </MyDialog>
  );
};

export default NetworkForm;

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import FundFormFieldSchema from "./fund-form-schema";
import { FundFormSchema, FundRow } from "./fund-type";

type FundFormProps = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<FundRow> & { id: number };
};

const FundForm: FC<FundFormProps> = ({
  mode = "create",
  api = "/funds",
  method = "POST",
  data = undefined,
}) => {
  return (
    <MyDialog
      size="xl"
      title={mode === "create" ? "fund.create_title" : "fund.edit_title"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={FundFormFieldSchema()}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={FundFormSchema}
        method={method}
        queryKey="funds"
      />
    </MyDialog>
  );
};

export default FundForm;

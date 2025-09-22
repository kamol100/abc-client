"use client";
import { FC } from "react";
import { DialogWrapper } from "../dialog";
import FormBuilder from "../form-wrapper/form-builder";
import { AddPlus } from "../icon";
import { UserSchema } from "../schema/user";
import ClientFormSchema from "./client-form-schema";

type props = {
  mode?: string;
  api?: string;
  method?: "GET | POST | PUT";
  data?: any;
};

const ClientForm: FC<props> = ({
  mode = "create",
  api = "/clients",
  method = "POST",
  data = undefined,
}) => {
  //console.log(data);
  return (
    <DialogWrapper
      title={mode === "create" ? "create_user" : "edit_user"}
      trigger={mode === "create" ? "Add" : "Edit"}
      Icon={AddPlus}
    >
      <FormBuilder
        formSchema={ClientFormSchema()}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={UserSchema}
        method={method}
        queryKey="clients"
      />
    </DialogWrapper>
  );
};

export default ClientForm;

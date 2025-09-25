"use client";
import { useRouter } from "next/navigation";
import { FC } from "react";
import FormBuilder from "../form-wrapper/form-builder";
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
  const router = useRouter();
  return (
    <div className="max-w-screen-lg mt-5 mx-auto overflow-y-auto pb-20">
      <FormBuilder
        formSchema={ClientFormSchema()}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={UserSchema}
        method={method}
        queryKey="clients"
        actionButtonClass="justify-center"
        onClose={() => router.push("/clients")}
        accordion
      />
    </div>
  );
};

export default ClientForm;

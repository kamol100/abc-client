"use client";
import { useRouter } from "next/navigation";
import { FC } from "react";
import AccordionFormBuilder from "../form-wrapper/accordion-form-builder";
import { ClientSchema } from "./client-zod-schema";
import ClientFormSchema from "./client-form-schema";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Record<string, unknown>;
};

const ClientForm: FC<Props> = ({
  mode = "create",
  api = "/clients",
  method = "POST",
  data,
}) => {
  const router = useRouter();
  return (
    <div className="w-full md:w-3/4 mx-auto flex flex-col flex-1 min-h-0">
      <AccordionFormBuilder
        formSchema={ClientFormSchema({ mode })}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={ClientSchema}
        method={method}
        queryKey="clients"
        fullPage
        actionButtonClass="justify-center"
        onClose={() => router.push("/clients")}
      />
    </div>
  );
};

export default ClientForm;

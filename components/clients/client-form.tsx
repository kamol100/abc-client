"use client";

import { useRouter } from "next/navigation";
import { FC } from "react";
import AccordionFormBuilder from "../form-wrapper/accordion-form-builder";
import { ClientFormSchema } from "./client-type";
import ClientFormFieldSchema from "./client-form-schema";
import type { ClientRow } from "./client-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: { id?: string | number } & Omit<Partial<ClientRow>, "id">;
};

const ClientForm: FC<Props> = ({
  mode = "create",
  api = "/clients",
  method = "POST",
  data,
}) => {
  const router = useRouter();

  return (
    <AccordionFormBuilder
      formSchema={ClientFormFieldSchema({ mode })}
      grids={2}
      data={data}
      api={api}
      mode={mode}
      schema={ClientFormSchema}
      method={method}
      queryKey="clients"
      fullPage
      actionButtonClass="justify-center"
      onClose={() => router.push("/clients")}
    />

  );
};

export default ClientForm;

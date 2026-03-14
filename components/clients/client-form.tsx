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
    <div className="w-full md:w-3/4 mx-auto flex flex-col flex-1 min-h-0">
      <div className="pr-3 pb-4">
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
      </div>
    </div>
  );
};

export default ClientForm;

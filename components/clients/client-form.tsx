"use client";

import { FieldValues } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FC } from "react";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import ClientImageFields from "@/components/clients/client-image-fields";
import ClientFormFieldSchema from "@/components/clients/client-form-schema";
import { ClientFormSchema, type ClientRow } from "@/components/clients/client-type";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<ClientRow>;
};

const CLIENT_IMAGE_KEYS = ["photo", "nid_front", "nid_back"] as const;

function omitClientImages(values: FieldValues): FieldValues {
  const payload = { ...values };
  for (const key of CLIENT_IMAGE_KEYS) {
    delete payload[key];
  }
  return payload;
}

const ClientForm: FC<Props> = ({
  mode = "create",
  api = "/clients",
  method = "POST",
  data,
}) => {
  const router = useRouter();
  const { data: nextSidResponse } = useApiQuery<ApiResponse<{ sid: number }>>({
    queryKey: ["clients", "next-sid"],
    url: "client-next-sid",
    pagination: false,
    enabled: mode === "create",
  });
  const nextSid = nextSidResponse?.data?.sid;

  return (
    <AccordionFormBuilder
      formSchema={ClientFormFieldSchema({ mode, nextSid })}
      grids={2}
      data={data}
      api={api}
      mode={mode}
      schema={ClientFormSchema}
      method={method}
      queryKey="clients"
      fullPage
      actionButtonClass="justify-center"
      transformPayload={omitClientImages}
      sectionSlots={{
        client_images: <ClientImageFields />,
      }}
      onClose={() => router.push("/clients")}
    />
  );
};

export default ClientForm;

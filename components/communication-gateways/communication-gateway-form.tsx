"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import FormTrigger from "@/components/form-trigger";
import {
  CommunicationGatewayFormSchema,
  type CommunicationGatewayRow,
} from "./communication-gateway-type";
import { CommunicationGatewayFormFieldSchema } from "./communication-gateway-form-schema";

type Props = {
  mode?: "create" | "edit";
  data?: Partial<CommunicationGatewayRow> & { id: number };
  defaultOpen?: boolean;
};

const CommunicationGatewayForm: FC<Props> = ({
  mode = "create",
  data,
  defaultOpen = false,
}) => {
  const title =
    mode === "create"
      ? "communication_gateway.create_title"
      : "communication_gateway.edit_title";

  return (
    <MyDialog
      size="4xl"
      title={title}
      trigger={mode === "create" ? <FormTrigger mode="create" /> : undefined}
      defaultOpen={defaultOpen}
      showFooter={false}
    >
      <AccordionFormBuilder
        formSchema={CommunicationGatewayFormFieldSchema()}
        grids={2}
        data={data}
        api="communication-gateways"
        mode={mode}
        schema={CommunicationGatewayFormSchema}
        method={mode === "edit" ? "PUT" : "POST"}
        queryKey="communicationGateways"
      />
    </MyDialog>
  );
};

export default CommunicationGatewayForm;

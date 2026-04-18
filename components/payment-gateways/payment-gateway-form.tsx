"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import FormTrigger from "@/components/form-trigger";
import {
  PaymentGatewayFormSchema,
  type PaymentGatewayRow,
} from "./payment-gateway-type";
import PaymentGatewayFormFieldSchema from "./payment-gateway-form-schema";

type Props = {
  mode?: "create" | "edit";
  data?: Partial<PaymentGatewayRow> & { id: string };
  defaultOpen?: boolean;
};

const PaymentGatewayForm: FC<Props> = ({
  mode = "create",
  data,
  defaultOpen = false,
}) => {
  const title =
    mode === "create"
      ? "payment_gateway.create_title"
      : "payment_gateway.edit_title";

  return (
    <MyDialog
      size="4xl"
      title={title}
      trigger={mode === "create" ? <FormTrigger mode="create" /> : undefined}
      defaultOpen={defaultOpen}
      showFooter={false}
    >
      <AccordionFormBuilder
        formSchema={PaymentGatewayFormFieldSchema()}
        grids={2}
        data={data}
        api="payment-gateways"
        mode={mode}
        schema={PaymentGatewayFormSchema}
        method={mode === "edit" ? "PUT" : "POST"}
        queryKey="paymentGateways"
      />
    </MyDialog>
  );
};

export default PaymentGatewayForm;

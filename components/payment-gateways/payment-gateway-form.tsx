"use client";

import { FC } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import {
  PaymentGatewayFormSchema,
  type PaymentGatewayRow,
} from "./payment-gateway-type";
import PaymentGatewayFormFieldSchema from "./payment-gateway-form-schema";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<PaymentGatewayRow> & { id: string };
  /** When set, dialog is controlled (e.g. deep link). Omit for toolbar/row triggers like zone-form. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const PaymentGatewayForm: FC<Props> = ({
  mode = "create",
  api = "payment-gateways",
  method: methodProp,
  data = undefined,
  open,
  onOpenChange,
}) => {
  const method = methodProp ?? (mode === "edit" ? "PUT" : "POST");
  const isControlled = open !== undefined;

  return (
    <MyDialog
      size="4xl"
      title={
        mode === "create"
          ? "payment_gateway.create_title"
          : "payment_gateway.edit_title"
      }
      trigger={isControlled ? undefined : <FormTrigger mode={mode} />}
      open={open}
      onOpenChange={onOpenChange}
    >
      <FormBuilder
        formSchema={PaymentGatewayFormFieldSchema()}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={PaymentGatewayFormSchema}
        method={method}
        queryKey="paymentGateways"
      />
    </MyDialog>
  );
};

export default PaymentGatewayForm;

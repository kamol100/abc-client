"use client";

import { FC } from "react";
import PaymentGatewayTable from "@/components/payment-gateways/payment-gateway-table";
import PaymentGatewayForm from "@/components/payment-gateways/payment-gateway-form";

type Props = {
  initialGatewayId?: string;
};

const PaymentGatewaysContent: FC<Props> = ({ initialGatewayId }) => {
  return (
    <>
      <PaymentGatewayTable />
      {initialGatewayId && (
        <PaymentGatewayForm
          mode="edit"
          data={{ id: initialGatewayId }}
          defaultOpen
        />
      )}
    </>
  );
};

export default PaymentGatewaysContent;

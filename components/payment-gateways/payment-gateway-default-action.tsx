"use client";

import { FC } from "react";
import { Star } from "lucide-react";
import MyButton from "@/components/my-button";
import useApiMutation from "@/hooks/use-api-mutation";

type Props = {
  gatewayId: string;
  isDefault?: boolean;
  disabled?: boolean;
};

const PaymentGatewayDefaultAction: FC<Props> = ({
  gatewayId,
  isDefault = false,
  disabled = false,
}) => {
  const { mutate, isPending } = useApiMutation({
    url: `/payment-gateways/${gatewayId}/default`,
    method: "PUT",
    invalidateKeys: "paymentGateways",
    successMessage: "payment_gateway.default_updated",
  });

  return (
    <MyButton
      variant={isDefault ? "default" : "outline"}
      size="icon"
      onClick={() => mutate()}
      disabled={disabled || isPending || isDefault}
      title={
        isDefault
          ? "payment_gateway.is_default.label"
          : "payment_gateway.make_default"
      }
    >
      <Star className={`h-4 w-4 ${isDefault ? "fill-current" : ""}`} />
    </MyButton>
  );
};

export default PaymentGatewayDefaultAction;

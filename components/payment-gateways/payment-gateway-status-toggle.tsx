"use client";

import { FC, useState } from "react";
import { Switch } from "@/components/ui/switch";
import useApiMutation from "@/hooks/use-api-mutation";
import type { PaymentStatus } from "./payment-gateway-type";

type Props = {
  gatewayId: string;
  status?: PaymentStatus;
  disabled?: boolean;
};

const PaymentGatewayStatusToggle: FC<Props> = ({
  gatewayId,
  status = "inactive",
  disabled = false,
}) => {
  const [current, setCurrent] = useState<PaymentStatus>(status);

  const { mutate, isPending } = useApiMutation({
    url: `/payment-gateways/${gatewayId}/status`,
    method: "PUT",
    invalidateKeys: "paymentGateways",
    successMessage: "payment_gateway.status_updated",
    onSuccess: () => {
      setCurrent((prev) => (prev === "active" ? "inactive" : "active"));
    },
  });

  return (
    <Switch
      checked={current === "active"}
      onCheckedChange={() => mutate()}
      disabled={disabled || isPending}
    />
  );
};

export default PaymentGatewayStatusToggle;

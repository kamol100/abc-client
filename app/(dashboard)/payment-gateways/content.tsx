"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentGatewayTable from "@/components/payment-gateways/payment-gateway-table";
import PaymentGatewayForm from "@/components/payment-gateways/payment-gateway-form";

type Props = {
  initialGatewayId?: string;
};

const PaymentGatewaysContent: FC<Props> = ({ initialGatewayId }) => {
  const router = useRouter();
  const [deepLinkOpen, setDeepLinkOpen] = useState(Boolean(initialGatewayId));

  useEffect(() => {
    setDeepLinkOpen(Boolean(initialGatewayId));
  }, [initialGatewayId]);

  const handleDeepLinkOpenChange = useCallback(
    (next: boolean) => {
      setDeepLinkOpen(next);
      if (!next) {
        router.replace("/payment-gateways");
      }
    },
    [router],
  );

  return (
    <>
      <PaymentGatewayTable />
      {initialGatewayId ? (
        <PaymentGatewayForm
          mode="edit"
          data={{ id: initialGatewayId }}
          api="payment-gateways"
          method="PUT"
          open={deepLinkOpen}
          onOpenChange={handleDeepLinkOpenChange}
        />
      ) : null}
    </>
  );
};

export default PaymentGatewaysContent;

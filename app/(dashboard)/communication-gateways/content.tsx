"use client";

import { FC } from "react";
import CommunicationGatewayTable from "@/components/communication-gateways/communication-gateway-table";
import CommunicationGatewayForm from "@/components/communication-gateways/communication-gateway-form";

type Props = {
  initialGatewayId?: number;
};

const CommunicationGatewaysContent: FC<Props> = ({
  initialGatewayId,
}) => {
  return (
    <>
      <CommunicationGatewayTable />
      {initialGatewayId != null && (
        <CommunicationGatewayForm
          mode="edit"
          data={{ id: initialGatewayId }}
          defaultOpen
        />
      )}
    </>
  );
};

export default CommunicationGatewaysContent;

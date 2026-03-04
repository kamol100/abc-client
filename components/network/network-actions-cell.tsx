"use client";

import { FC } from "react";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import NetworkForm from "./network-form";
import { NetworkRow } from "./network-type";

type Props = {
  network: NetworkRow;
};

const NetworkActionsCell: FC<Props> = ({ network }) => {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("networks.edit");
  const canDelete = hasPermission("networks.delete");

  if (!canEdit && !canDelete) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      {canEdit && (
        <NetworkForm
          mode="edit"
          data={{ id: network.id }}
          api="/networks"
          method="PUT"
        />
      )}
      {canDelete && (
        <DeleteModal
          api_url={`/networks/${network.id}`}
          keys="networks"
          confirmMessage="network.delete_confirmation"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
};

export default NetworkActionsCell;

"use client";

import { FC } from "react";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import DeviceForm from "./device-form";
import { DeviceRow } from "./device-type";

type Props = {
  device: DeviceRow;
};

const DeviceActionsCell: FC<Props> = ({ device }) => {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("devices.edit");
  const canDelete = hasPermission("devices.delete");

  if (!canEdit && !canDelete) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      {canEdit && (
        <DeviceForm
          mode="edit"
          data={{ id: device.id }}
          api="/devices"
          method="PUT"
        />
      )}
      {canDelete && (
        <DeleteModal
          api_url={`/devices/${device.id}`}
          keys="devices"
          confirmMessage="device.delete_confirmation"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
};

export default DeviceActionsCell;

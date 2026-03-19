"use client";

import { FC } from "react";
import MyBadge from "@/components/my-badge";
import { useTranslation } from "react-i18next";
import { DeviceRow } from "./device-type";

type Props = {
  device: DeviceRow;
};

const DeviceStatusCell: FC<Props> = ({ device }) => {
  const { t } = useTranslation();
  const statusValue = String(device.status ?? "").toLowerCase();
  const isActive = statusValue === "active" || statusValue === "1";

  return (
    <MyBadge type={isActive ? "success" : "decline"} className="capitalize">
      {isActive ? t("device.status.active") : t("device.status.inactive")}
    </MyBadge>
  );
};

export default DeviceStatusCell;

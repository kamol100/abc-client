"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import MyBadge from "@/components/my-badge";

type Props = {
  status?: number | null;
};

const NetworkStatusCell: FC<Props> = ({ status }) => {
  const { t } = useTranslation();
  const isActive = Number(status) === 1;

  return (
    <MyBadge type={isActive ? "success" : "decline"} className="capitalize">
      {isActive ? t("common.active") : t("common.inactive")}
    </MyBadge>
  );
};

export default NetworkStatusCell;

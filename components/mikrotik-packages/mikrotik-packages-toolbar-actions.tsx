"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import ActionButton from "@/components/action-button";
import MikrotikPackageForm from "@/components/mikrotik-packages/mikrotik-package-form";

const MikrotikPackagesToolbarActions: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission("mikrotik-packages.create");

  if (!canCreate) return null;

  return (
    <div className="flex items-center gap-2">
      <MikrotikPackageForm />
    </div>
  );
};

export default MikrotikPackagesToolbarActions;

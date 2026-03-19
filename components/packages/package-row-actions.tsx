"use client";

import { FC } from "react";
import { Row } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import MyButton from "@/components/my-button";
import { DeleteModal } from "@/components/delete-modal";
import PackageForm from "@/components/packages/package-form";
import { PackageRow } from "@/components/packages/package-type";
import { PackageFormType } from "@/components/packages/package-form-schema";

type Props = {
  row: Row<PackageRow>;
  packageType: PackageFormType;
};

const PackageRowActions: FC<Props> = ({ row, packageType }) => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const item = row.original;

  const canView = hasPermission("packages.show") || hasPermission("packages.access");
  const canEdit = hasPermission("packages.edit");
  const canDelete = hasPermission("packages.delete");
  const listType =
    packageType === "reseller" ? "reseller-packages" : "client-packages";

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      {canView && (
        <MyButton
          variant="outline"
          size="icon"
          className="h-8 w-8"
          url={`/client-packages/view/${item.id}?type=${listType}`}
          aria-label={t("common.view")}
        >
          <Eye className="h-4 w-4" />
        </MyButton>
      )}

      {canEdit && (
        <PackageForm
          mode="edit"
          data={{ id: item.id, is_reseller_package: item.is_reseller_package }}
          api="/packages"
          method="PUT"
          packageType={packageType}
        />
      )}

      {canDelete && (
        <DeleteModal
          api_url={`/packages/${item.id}`}
          keys="packages"
          confirmMessage="package.delete_confirmation"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
};

export default PackageRowActions;

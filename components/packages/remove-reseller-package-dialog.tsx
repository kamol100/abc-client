"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { DeleteModal } from "@/components/delete-modal";

type Props = {
  packageId: number;
  resellerUuid: string;
};

const RemoveResellerPackageDialog: FC<Props> = ({ packageId, resellerUuid }) => {
  const { t } = useTranslation();

  return (
    <DeleteModal
      api_url={`/remove-reseller-package/${packageId}/${resellerUuid}`}
      keys="packages,package-view"
      message="package.remove.success"
      confirmMessage="package.remove.confirmation"
      buttonText="package.remove.confirm_button"
    >
      <MyButton
        action="delete"
        variant="outline"
        size="sm"
        title={t("package.remove.button")}
      />
    </DeleteModal>
  );
};

export default RemoveResellerPackageDialog;

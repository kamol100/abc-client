"use client";

import MyButton, { type MyButtonProps } from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import useApiMutation from "@/hooks/use-api-mutation";
import { TriangleAlert } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type DeleteModalProps = {
  api_url: string;
  message?: string;
  confirmMessage?: string;
  keys?: string;
  redirectTo?: string;
  buttonText?: string;
  children?: ReactNode;
  tooltip?: MyButtonProps["tooltip"];
  tooltipPlacement?: MyButtonProps["tooltipPlacement"];
};

export function DeleteModal({
  api_url,
  message,
  confirmMessage,
  keys,
  redirectTo,
  buttonText,
  children,
  tooltip,
  tooltipPlacement,
}: DeleteModalProps) {
  const { t } = useTranslation();

  const { mutateAsync: deleteItem, isPending } = useApiMutation({
    url: api_url,
    method: "DELETE",
    invalidateKeys: keys,
    successMessage: message ?? "common.item_deleted_successfully",
    defaultErrorMessage: "common.delete_failed",
    redirectTo,
  });

  const handleDelete = async (close: () => void) => {
    await deleteItem();
    close();
  };

  return (
    <MyDialog
      trigger={children ?? (
        <MyButton action="delete" icon={true} tooltip={tooltip} tooltipPlacement={tooltipPlacement} />
      )}
      size="sm"
      loading={isPending}
      footer={({ close, loading }) => (
        <>
          <MyButton
            action="cancel"
            variant="outline"
            size="default"
            onClick={close}
            disabled={loading}
            title={t("common.cancel")}
          />
          <MyButton
            action="delete"
            variant="default"
            size="default"
            onClick={() => handleDelete(close)}
            disabled={loading}
            loading={loading}
            title={t(buttonText ?? "common.delete")}
          />
        </>
      )}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <DialogTitle className="text-center">
            {t("common.confirm_delete")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(confirmMessage ?? "delete_confirmation_message")}
          </DialogDescription>
        </div>
      </div>
    </MyDialog>
  );
}

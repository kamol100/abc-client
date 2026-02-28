"use client";

import ActionButton from "@/components/action-button";
import { DialogWrapper } from "@/components/dialog-wrapper";
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
};

export function DeleteModal({
  api_url,
  message,
  confirmMessage,
  keys,
  redirectTo,
  buttonText,
  children,
}: DeleteModalProps) {
  const { t } = useTranslation();

  const { mutateAsync: deleteItem, isPending } = useApiMutation({
    url: api_url,
    method: "DELETE",
    invalidateKeys: keys,
    successMessage: message ?? "item_deleted_successfully",
    defaultErrorMessage: "delete_failed",
    redirectTo,
  });

  return (
    <DialogWrapper
      trigger={children ?? <ActionButton action="delete" icon={true} />}
      size="sm"
      loading={isPending}
      footer={({ close, loading }) => (
        <>
          <ActionButton
            action="cancel"
            variant="outline"
            size="default"
            onClick={close}
            disabled={loading}
            title={t("cancel")}
          />
          <ActionButton
            action="delete"
            variant="default"
            size="default"
            onClick={() => deleteItem()}
            disabled={loading}
            loading={loading}
            title={t(buttonText ?? "delete")}
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
            {t("confirm_delete")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(confirmMessage ?? "delete_confirmation_message")}
          </DialogDescription>
        </div>
      </div>
    </DialogWrapper>
  );
}

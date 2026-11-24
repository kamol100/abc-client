"use client";

import MyButton, { type MyButtonProps } from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import useApiMutation from "@/hooks/use-api-mutation";
import { TriangleAlert } from "lucide-react";
import { ReactNode, useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  /** Show an optional "reason" field; its text is sent as `{ reason }` in the DELETE body. */
  withReason?: boolean;
};

const REASON_MAX_LENGTH = 500;

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
  withReason = false,
}: DeleteModalProps) {
  const { t } = useTranslation();
  const reasonId = useId();
  const [reason, setReason] = useState("");

  const { mutateAsync: deleteItem, isPending } = useApiMutation<unknown, { reason: string } | undefined>({
    url: api_url,
    method: "DELETE",
    invalidateKeys: keys,
    successMessage: message ?? "common.item_deleted_successfully",
    defaultErrorMessage: "common.delete_failed",
    redirectTo,
  });

  const handleDelete = async (close: () => void) => {
    const trimmed = reason.trim();
    await deleteItem(withReason && trimmed ? { reason: trimmed } : undefined);
    close();
  };

  return (
    <MyDialog
      trigger={children ?? (
        <MyButton action="delete" icon={true} tooltip={tooltip} tooltipPlacement={tooltipPlacement} />
      )}
      size="sm"
      loading={isPending}
      onOpenChange={(open) => {
        if (!open) setReason("");
      }}
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
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <DialogTitle className="text-center">
            {t("common.confirm_delete")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(confirmMessage ?? "common.delete_confirmation_message")}
          </DialogDescription>
        </div>
        {withReason && (
          <div className="flex w-full flex-col gap-1.5 text-left">
            <Label htmlFor={reasonId}>
              {t("common.delete_reason.label")}{" "}
              <span className="font-normal text-muted-foreground">({t("common.optional")})</span>
            </Label>
            <Textarea
              id={reasonId}
              rows={3}
              maxLength={REASON_MAX_LENGTH}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("common.delete_reason.placeholder")}
              disabled={isPending}
              className="resize-none"
            />
          </div>
        )}
      </div>
    </MyDialog>
  );
}

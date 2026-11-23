"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { DialogFooter } from "@/components/ui/dialog";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
  /** Translation key. */
  confirmLabel: string;
  confirmIcon: LucideIcon;
  pending?: boolean;
  disabled?: boolean;
  destructive?: boolean;
};

/**
 * Cancel + confirm for the queue dialogs: same size so they line up, each with an
 * icon; the confirm icon turns into a spinner while the request runs.
 */
export function CommunicationQueueConfirmFooter({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmIcon: Icon,
  pending = false,
  disabled = false,
  destructive = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <DialogFooter className="gap-2 sm:space-x-0">
      <MyButton
        action="cancel"
        variant="outline"
        size="default"
        onClick={onCancel}
        disabled={pending}
        title={t("common.cancel")}
      />
      <MyButton
        variant={destructive ? "destructive" : "default"}
        size="default"
        onClick={onConfirm}
        disabled={disabled || pending}
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Icon aria-hidden />}
        {t(confirmLabel)}
      </MyButton>
    </DialogFooter>
  );
}

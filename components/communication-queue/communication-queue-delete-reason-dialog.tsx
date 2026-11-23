"use client";

import { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Translation key: what will be deleted. */
  description: string;
  isPending: boolean;
  onConfirm: (reason: string) => void;
};

/**
 * Last step before deleting from the queue: the user must write why. The reason is
 * saved with their name in the SMS comment ("Deleted by {name}: {reason}").
 */
export function CommunicationQueueDeleteReasonDialog({ open, onOpenChange, description, isPending, onConfirm }: Props) {
  const { t } = useTranslation();
  const id = useId();
  const [reason, setReason] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
      setShowError(false);
    }
  }, [open]);

  const submit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setShowError(true);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("communication_queue.delete_confirm_title")}</DialogTitle>
          <DialogDescription>{t(description)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor={id}>
            {t("communication_queue.delete_reason.label")} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id={id}
            rows={3}
            maxLength={500}
            value={reason}
            placeholder={t("communication_queue.delete_reason.placeholder")}
            aria-invalid={showError}
            onChange={(event) => {
              setReason(event.target.value);
              if (showError && event.target.value.trim()) setShowError(false);
            }}
          />
          {/* Reserved line so the error does not push the buttons down. */}
          <p role={showError ? "alert" : undefined} className="min-h-5 text-sm text-destructive">
            {showError ? t("communication_queue.delete_reason.errors.required") : null}
          </p>
        </div>
        <DialogFooter>
          <MyButton variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </MyButton>
          <MyButton variant="destructive" size="default" onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("communication_queue.delete_sms")}
          </MyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useFetch } from "@/app/actions";
import { usePermissions } from "@/context/app-provider";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CommunicationQueueRestoreOptions,
  defaultRestoreOptions,
  isRestoreOptionsValid,
  restorePayload,
  type RestoreOptionsValue,
} from "./communication-queue-restore-options";
import { CommunicationQueueConfirmFooter } from "./communication-queue-confirm-footer";

/** Archive row: restore one deleted SMS (keep its status, or pending at a send time). */
export function CommunicationQueueRestoreButton({ smsId }: { smsId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<RestoreOptionsValue>(defaultRestoreOptions);

  const { mutate: restore, isPending } = useMutation({
    mutationFn: async (value: RestoreOptionsValue) => {
      const result = await useFetch({
        url: `/communication-queue/${smsId}/restore`,
        method: "POST",
        data: restorePayload(value),
      });
      if (!result?.success) throw result;
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communicationQueueArchive"] });
      queryClient.invalidateQueries({ queryKey: ["communicationQueue"] });
      toast.success(t("communication_queue.restore.success"));
      setOpen(false);
    },
    onError: (error: unknown) => {
      const msg = parseApiError(error);
      toast.error(t(String(msg || "common.request_failed")));
    },
  });

  if (!hasPermission("communication-queue.restore")) return null;

  const openDialog = () => {
    setOptions(defaultRestoreOptions());
    setOpen(true);
  };

  return (
    <>
      <MyButton
        onClick={openDialog}
        variant="outline"
        size="icon"
        tooltip={t("communication_queue.restore.label")}
        aria-label={t("communication_queue.restore.label")}
      >
        <ArchiveRestore className="h-4 w-4" />
      </MyButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("communication_queue.restore.label")}</DialogTitle>
          </DialogHeader>
          <CommunicationQueueRestoreOptions value={options} onChange={setOptions} />
          <CommunicationQueueConfirmFooter
            onCancel={() => setOpen(false)}
            onConfirm={() => restore(options)}
            confirmLabel="communication_queue.restore.submit"
            confirmIcon={ArchiveRestore}
            pending={isPending}
            disabled={!isRestoreOptionsValid(options)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

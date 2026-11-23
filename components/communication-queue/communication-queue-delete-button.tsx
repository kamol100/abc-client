"use client";

import { useState } from "react";
import { useFetch } from "@/app/actions";
import { usePermissions } from "@/context/app-provider";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";
import { CommunicationQueueDeleteReasonDialog } from "./communication-queue-delete-reason-dialog";

/** Deletes one SMS (any status) after the user writes a reason. */
export function CommunicationQueueDeleteButton({ smsId }: { smsId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(false);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: async (reason: string) => {
      const result = await useFetch({
        url: `/communication-queue/${smsId}`,
        method: "DELETE",
        data: { reason },
      });
      if (!result?.success) throw result;
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communicationQueue"] });
      toast.success(t("communication_queue.delete_success"));
      setOpen(false);
    },
    onError: (error: unknown) => {
      const msg = parseApiError(error);
      toast.error(t(String(msg || "common.request_failed")));
    },
  });

  if (!hasPermission("communication-queue.delete")) return null;

  return (
    <>
      <MyButton
        onClick={() => setOpen(true)}
        variant="outline"
        size="icon"
        tooltip={t("communication_queue.delete")}
        aria-label={t("communication_queue.delete")}
      >
        <Trash2 className="h-4 w-4" />
      </MyButton>
      <CommunicationQueueDeleteReasonDialog
        open={open}
        onOpenChange={setOpen}
        description="communication_queue.delete_confirm_one"
        isPending={isPending}
        onConfirm={(reason) => remove(reason)}
      />
    </>
  );
}

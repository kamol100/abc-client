"use client";

import { useFetch } from "@/app/actions";
import { usePermissions } from "@/context/app-provider";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleStop, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";

/** Stops one pending SMS right away (no confirm), like the inline Resend button. */
export function CommunicationQueueStopButton({ smsId }: { smsId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const { mutate: stop, isPending } = useMutation({
    mutationFn: async () => {
      const result = await useFetch({
        url: `/communication-queue/${smsId}/stop`,
        method: "POST",
      });
      if (!result?.success) throw result;
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communicationQueue"] });
      toast.success(t("communication_queue.stop_success"));
    },
    onError: (error: unknown) => {
      const msg = parseApiError(error);
      toast.error(t(String(msg || "common.request_failed")));
    },
  });

  if (!hasPermission("communication-queue.stop")) return null;

  return (
    <MyButton
      onClick={() => stop()}
      disabled={isPending}
      unstyled
      className="p-0 hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CircleStop className="h-4 w-4" />
        )}
        <span>{t("communication_queue.stop")}</span>
      </div>
    </MyButton>
  );
}

"use client";

import { useFetch } from "@/app/actions";
import { usePermissions } from "@/context/app-provider";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";

interface CommunicationQueueResendButtonProps {
  smsId: string;
}

export function CommunicationQueueResendButton({
  smsId,
}: CommunicationQueueResendButtonProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const { mutate: resend, isPending } = useMutation({
    mutationFn: async () => {
      const result = await useFetch({
        url: `/communication-queue/${smsId}/resend`,
        method: "POST",
        data: { sms: "single" },
      });
      if (!result?.success) throw result;
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communicationQueue"] });
      toast.success(t("communication_queue.resend_success"));
    },
    onError: (error: unknown) => {
      const msg = parseApiError(error);
      toast.error(t(String(msg || "common.request_failed")));
    },
  });

  const canResend = hasPermission("communication-queue.resend");

  if (!canResend) return null;

  return (
    <MyButton
      onClick={() => resend()}
      disabled={isPending}
      title={t("communication_queue.resend")}
      unstyled
      className="p-0 hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        <span>{t("communication_queue.resend")}</span>
      </div>
    </MyButton>
  );
}

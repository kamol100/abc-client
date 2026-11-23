"use client";

import { useFetch } from "@/app/actions";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleStop, Loader2, RefreshCw, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const SMS_TYPE_OPTIONS = ["custom_client", "custom_other", "invoice_due", "invoice_due_reminder"] as const;

export type CommunicationQueueBulkAction = "resend" | "stop";

/** Resend All requeues stopped/failed SMS; Stop All stops pending SMS. Same type picker. */
const BULK_ACTIONS: Record<
  CommunicationQueueBulkAction,
  { url: string; icon: LucideIcon; title: string; submit: string; success: string }
> = {
  resend: {
    url: "/communication-queue/resend-all",
    icon: RefreshCw,
    title: "communication_queue.resend_all",
    submit: "communication_queue.resend_sms",
    success: "communication_queue.resend_success",
  },
  stop: {
    url: "/communication-queue/stop-all",
    icon: CircleStop,
    title: "communication_queue.stop_all",
    submit: "communication_queue.stop_sms",
    success: "communication_queue.stop_success",
  },
};

export function CommunicationQueueBulkDialog({ action }: { action: CommunicationQueueBulkAction }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const config = BULK_ACTIONS[action];
  const Icon = config.icon;
  const [open, setOpen] = useState(false);
  const [allSms, setAllSms] = useState(true);
  const [smsType, setSmsType] = useState<string[]>(["all"]);

  const { mutate: submitBulk, isPending } = useMutation({
    mutationFn: async (payload: { sms_type: string[] }) => {
      const result = await useFetch({
        url: config.url,
        method: "POST",
        data: payload,
      });
      if (!result?.success) throw result;
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communicationQueue"] });
      toast.success(t(config.success));
      setOpen(false);
    },
    onError: (error: unknown) => {
      const msg = parseApiError(error);
      toast.error(t(String(msg || "common.request_failed")));
    },
  });

  const handleAllSms = (checked: boolean) => {
    if (checked) {
      setSmsType(["all"]);
      setAllSms(true);
    }
  };

  const handleSmsType = (value: string, checked: boolean) => {
    setSmsType((prev) =>
      checked ? [...prev.filter((x) => x !== "all"), value] : prev.filter((x) => x !== value)
    );
  };

  useEffect(() => {
    if (smsType.length > 1 || (smsType.length === 1 && !smsType.includes("all"))) {
      setAllSms(false);
    }
    if (smsType.length === 0) {
      setSmsType(["all"]);
      setAllSms(true);
    }
  }, [smsType]);

  const handleSubmit = () => {
    submitBulk({ sms_type: smsType });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MyButton
          size="icon"
          variant="outline"
          className="shrink-0"
          tooltip={t(config.title)}
          aria-label={t(config.title)}
        >
          <Icon className="h-4 w-4" />
        </MyButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(config.title)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${action}-type-all`}
              checked={allSms}
              onCheckedChange={(checked) => handleAllSms(checked === true)}
            />
            <Label
              htmlFor={`${action}-type-all`}
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("communication_queue.sms_type.options.all")}
            </Label>
          </div>
          {SMS_TYPE_OPTIONS.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`${action}-type-${type}`}
                checked={smsType.includes(type)}
                onCheckedChange={(checked) => handleSmsType(type, checked === true)}
              />
              <Label
                htmlFor={`${action}-type-${type}`}
                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t(`communication_queue.sms_type.options.${type}`)}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <MyButton variant="outline" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </MyButton>
          <MyButton variant="default" size="default" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t(config.submit)}
          </MyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

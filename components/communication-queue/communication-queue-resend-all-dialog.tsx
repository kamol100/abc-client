"use client";

import { useFetch } from "@/app/actions";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ActionButton from "@/components/action-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const SMS_TYPE_OPTIONS = ["custom", "invoice_due", "invoice_due_reminder"] as const;

export function CommunicationQueueResendAllDialog() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [allSms, setAllSms] = useState(true);
  const [smsType, setSmsType] = useState<string[]>(["all"]);

  const { mutate: resendAll, isPending } = useMutation({
    mutationFn: async (payload: { sms_type: string[] }) => {
      const result = await useFetch({
        url: "/communication-queue/resend-all",
        method: "POST",
        data: payload,
      });
      if (!result?.success) throw result;
      return result?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communicationQueue"] });
      toast.success(t("communication_queue.resend_success"));
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
    resendAll({ sms_type: smsType });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
          unstyled
          className="p-0 hover:bg-transparent"
          title={t("communication_queue.resend_all")}
        >
          <div className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>{t("communication_queue.resend_all")}</span>
          </div>
        </ActionButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("communication_queue.resend_all")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="type-all"
              checked={allSms}
              onCheckedChange={(checked) => handleAllSms(checked === true)}
            />
            <Label
              htmlFor="type-all"
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("communication_queue.sms_type.options.all")}
            </Label>
          </div>
          {SMS_TYPE_OPTIONS.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={smsType.includes(type)}
                onCheckedChange={(checked) => handleSmsType(type, checked === true)}
              />
              <Label
                htmlFor={`type-${type}`}
                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t(`communication_queue.sms_type.options.${type}`)}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("communication_queue.resend_sms")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useFetch } from "@/app/actions";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, CircleStop, RefreshCw, Trash2, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import MyButton from "@/components/my-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CommunicationQueueConfirmFooter } from "./communication-queue-confirm-footer";
import { CommunicationQueueDeleteReasonDialog } from "./communication-queue-delete-reason-dialog";
import {
  CommunicationQueueRestoreOptions,
  defaultRestoreOptions,
  isRestoreOptionsValid,
  restorePayload,
  type RestoreOptionsValue,
} from "./communication-queue-restore-options";

const SMS_TYPE_OPTIONS = ["custom_client", "custom_other", "invoice_due", "invoice_due_reminder"] as const;
/** Actions with a status picker: every status starts checked. */
const STATUS_OPTIONS = ["pending", "processing", "completed", "sent", "failed", "stop"] as const;

export type CommunicationQueueBulkAction = "resend" | "stop" | "delete" | "restore" | "purge";

type BulkPayload = {
  sms_type: string[];
  statuses?: string[];
  reason?: string;
  status_mode?: "keep" | "pending";
  send_at?: string;
};

/**
 * Queue: Resend All requeues stopped/failed SMS; Stop All stops pending SMS; Delete All
 * deletes the chosen statuses after a reason. Archive: Restore All brings deleted SMS
 * back (keep status, or pending at a send time); Delete All Permanently removes them.
 * Same type picker for all.
 */
const BULK_ACTIONS: Record<
  CommunicationQueueBulkAction,
  {
    url: string;
    icon: LucideIcon;
    title: string;
    submit: string;
    success: string;
    /** Pick which statuses to include. */
    pickStatus?: boolean;
    /** Confirm with a written reason before sending. */
    askReason?: boolean;
    /** Keep-status / pending + send time choices. */
    restoreOptions?: boolean;
    destructive?: boolean;
    /** Lists to refresh afterwards. */
    refresh: string[];
  }
> = {
  resend: {
    url: "/communication-queue/resend-all",
    icon: RefreshCw,
    title: "communication_queue.resend_all",
    submit: "communication_queue.resend_sms",
    success: "communication_queue.resend_success",
    refresh: ["communicationQueue"],
  },
  stop: {
    url: "/communication-queue/stop-all",
    icon: CircleStop,
    title: "communication_queue.stop_all",
    submit: "communication_queue.stop_sms",
    success: "communication_queue.stop_success",
    refresh: ["communicationQueue"],
  },
  delete: {
    url: "/communication-queue/delete-all",
    icon: Trash2,
    title: "communication_queue.delete_all",
    submit: "communication_queue.delete_sms",
    success: "communication_queue.delete_success",
    pickStatus: true,
    askReason: true,
    destructive: true,
    refresh: ["communicationQueue", "communicationQueueArchive"],
  },
  restore: {
    url: "/communication-queue/restore-all",
    icon: ArchiveRestore,
    title: "communication_queue.restore.all",
    submit: "communication_queue.restore.submit",
    success: "communication_queue.restore.success",
    pickStatus: true,
    restoreOptions: true,
    refresh: ["communicationQueue", "communicationQueueArchive"],
  },
  purge: {
    url: "/communication-queue/force-delete-all",
    icon: Trash2,
    title: "communication_queue.force_delete.all",
    submit: "communication_queue.force_delete.submit",
    success: "communication_queue.force_delete.success",
    pickStatus: true,
    destructive: true,
    refresh: ["communicationQueueArchive"],
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
  const [statuses, setStatuses] = useState<string[]>([...STATUS_OPTIONS]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restore, setRestore] = useState<RestoreOptionsValue>(defaultRestoreOptions);

  const { mutate: submitBulk, isPending } = useMutation({
    mutationFn: async (payload: BulkPayload) => {
      const result = await useFetch({
        url: config.url,
        method: "POST",
        data: payload,
      });
      if (!result?.success) throw result;
      return result?.data;
    },
    onSuccess: () => {
      config.refresh.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      toast.success(t(config.success));
      setConfirmOpen(false);
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

  const handleStatus = (value: string, checked: boolean) => {
    setStatuses((prev) => (checked ? [...prev, value] : prev.filter((x) => x !== value)));
  };

  const basePayload = (): BulkPayload => ({
    sms_type: smsType,
    ...(config.pickStatus ? { statuses } : {}),
    ...(config.restoreOptions ? restorePayload(restore) : {}),
  });

  const handleSubmit = () => {
    if (config.askReason) {
      setConfirmOpen(true);
      return;
    }
    submitBulk(basePayload());
  };

  const handleOpenChange = (next: boolean) => {
    // Each opening starts from now for the send time.
    if (next && config.restoreOptions) setRestore(defaultRestoreOptions());
    setOpen(next);
  };

  const canSubmit =
    (!config.pickStatus || statuses.length > 0) &&
    (!config.restoreOptions || isRestoreOptionsValid(restore));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
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
          {config.pickStatus && (
            <fieldset className="grid gap-3 border-t pt-4">
              <legend className="float-left mb-1 text-sm font-medium">{t("communication_queue.status.label")}</legend>
              {STATUS_OPTIONS.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${action}-status-${status}`}
                    checked={statuses.includes(status)}
                    onCheckedChange={(checked) => handleStatus(status, checked === true)}
                  />
                  <Label
                    htmlFor={`${action}-status-${status}`}
                    className="cursor-pointer text-sm font-medium leading-none"
                  >
                    {t(`communication_queue.status.options.${status}`)}
                  </Label>
                </div>
              ))}
            </fieldset>
          )}
          {config.restoreOptions && (
            <div className="border-t pt-4">
              <CommunicationQueueRestoreOptions value={restore} onChange={setRestore} />
            </div>
          )}
        </div>
        <CommunicationQueueConfirmFooter
          onCancel={() => setOpen(false)}
          onConfirm={handleSubmit}
          confirmLabel={config.submit}
          confirmIcon={config.icon}
          pending={isPending && !confirmOpen}
          disabled={!canSubmit}
          destructive={config.destructive}
        />
      </DialogContent>
      {config.askReason && (
        <CommunicationQueueDeleteReasonDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="communication_queue.delete_confirm_all"
          isPending={isPending}
          onConfirm={(reason) => submitBulk({ ...basePayload(), reason })}
        />
      )}
    </Dialog>
  );
}

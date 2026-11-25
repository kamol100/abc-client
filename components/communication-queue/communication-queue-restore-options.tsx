"use client";

import { useId } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { DateInput } from "@/components/controls/date-input";
import FieldLabel from "@/components/label";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type RestoreStatusMode = "pending" | "keep";

export type RestoreOptionsValue = {
  mode: RestoreStatusMode;
  /** New send time for pending (local time). */
  sendAt: Date | null;
};

export const defaultRestoreOptions = (): RestoreOptionsValue => {
  const now = new Date();
  now.setSeconds(0, 0);
  return { mode: "pending", sendAt: now };
};

/** API body: pending sends `send_at` as "YYYY-MM-DD HH:mm:ss" (local time); keep sends no time. */
export const restorePayload = (value: RestoreOptionsValue) =>
  value.mode === "pending" && value.sendAt
    ? { status_mode: "pending" as const, send_at: format(value.sendAt, "yyyy-MM-dd HH:mm:ss") }
    : { status_mode: value.mode };

export const isRestoreOptionsValid = (value: RestoreOptionsValue) =>
  value.mode === "keep" || (value.sendAt instanceof Date && !Number.isNaN(value.sendAt.getTime()));


/**
 * Restore choices: keep the old status, or queue it again as pending at a send time
 * (a date and time, defaults to now). The time only applies to pending.
 */
export function CommunicationQueueRestoreOptions({
  value,
  onChange,
}: {
  value: RestoreOptionsValue;
  onChange: (value: RestoreOptionsValue) => void;
}) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-3">
        <legend className="float-left mb-1 text-sm font-medium">{t("communication_queue.restore.status_label")}</legend>
        <RadioGroup
          value={value.mode}
          onValueChange={(mode) => onChange({ ...value, mode: mode as RestoreStatusMode })}
          className="grid gap-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="pending" id={`${id}-pending`} />
            <Label htmlFor={`${id}-pending`} className="cursor-pointer font-normal">
              {t("communication_queue.restore.mode_pending")}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="keep" id={`${id}-keep`} />
            <Label htmlFor={`${id}-keep`} className="cursor-pointer font-normal">
              {t("communication_queue.restore.mode_keep")}
            </Label>
          </div>
        </RadioGroup>
      </fieldset>
      <div className="grid gap-1">
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor="send_at" label={{ labelText: "communication_queue.restore.send_at" }} />
          <DateInput
            id="send_at"
            value={value.sendAt}
            onChange={(sendAt) => onChange({ ...value, sendAt: sendAt ?? null })}
            onClear={() => onChange({ ...value, sendAt: null })}
            placeholder="communication_queue.restore.send_at"
            showTime
            clearable={false}
            disabled={value.mode !== "pending"}
          />
        </div>
        {/* Fixed line so switching the mode does not move the buttons. */}
        <p className="min-h-5 text-xs text-muted-foreground">
          {value.mode === "pending"
            ? t("communication_queue.restore.send_at_hint")
            : t("communication_queue.restore.send_at_keep_hint")}
        </p>
      </div>
    </div>
  );
}

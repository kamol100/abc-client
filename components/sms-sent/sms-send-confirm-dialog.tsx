"use client";

import { formatInTimeZone } from "date-fns-tz";
import { AlertTriangle, Clock, FlaskConical, Send } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import DisplayMoney from "@/components/display-money";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import useApiMutation from "@/hooks/use-api-mutation";
import {
  SmsSendMode,
  SmsSendQuote,
  SmsSentPayload,
  canConfirmSmsSend,
} from "@/components/sms-sent/sms-sent-type";
import { cn } from "@/lib/utils";

interface SmsSendConfirmDialogProps {
  payload: SmsSentPayload | null;
  mode: SmsSendMode;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: { sendNow: boolean }) => void;
}

function QuoteRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums">{children}</dd>
    </div>
  );
}

function Money({ amount, className }: { amount: number; className?: string }) {
  return <DisplayMoney amount={amount} formatCurrency className={className} />;
}

function QuoteSkeleton() {
  return (
    <div className="space-y-3 py-2" aria-busy>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-5 w-full" />
      ))}
    </div>
  );
}

function InsufficientBalanceAlert({ quote }: { quote: SmsSendQuote }) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium">{t("sms_sent.confirm.insufficient.title")}</p>
        <p>
          {t("sms_sent.confirm.insufficient.required")}: <Money amount={quote.total_cost} />
          {" · "}
          {t("sms_sent.confirm.insufficient.available")}: <Money amount={quote.balance ?? 0} />
        </p>
      </div>
    </div>
  );
}

function ScheduleNotice({
  scheduledAt,
  timezone,
  sendNow,
  onSendNowChange,
  disabled,
}: {
  scheduledAt: string;
  timezone: string;
  sendNow: boolean;
  onSendNowChange: (value: boolean) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const scheduledTime = formatInTimeZone(new Date(scheduledAt), timezone, "h:mm a");

  return (
    <div className="space-y-3 rounded-md border bg-muted/40 p-3">
      <div className="flex items-start gap-2 text-sm">
        <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium">
            {t("sms_sent.confirm.schedule.time")}: {scheduledTime}
          </p>
          <p className="text-muted-foreground">
            {sendNow
              ? t("sms_sent.confirm.schedule.immediate_hint")
              : t("sms_sent.confirm.schedule.scheduled_hint", { time: scheduledTime })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="sms-send-now"
          checked={sendNow}
          disabled={disabled}
          onCheckedChange={(checked) => onSendNowChange(checked === true)}
        />
        <Label htmlFor="sms-send-now" className="cursor-pointer font-normal">
          {t("sms_sent.confirm.schedule.send_now")}
        </Label>
      </div>
    </div>
  );
}

function QuoteSummary({ quote, isTestMode }: { quote: SmsSendQuote; isTestMode: boolean }) {
  const { t } = useTranslation();
  const showRemaining = !isTestMode && quote.sufficient && quote.remaining_balance !== null;

  return (
    <dl className="divide-y rounded-md border px-3">
      <QuoteRow label={t("sms_sent.confirm.recipients")}>
        <DisplayCount amount={quote.recipients} />
      </QuoteRow>
      <QuoteRow label={t("sms_sent.sms_count.label")}>
        <DisplayCount amount={quote.total_units} />
      </QuoteRow>
      <QuoteRow label={t("sms_sent.total_cost.label")}>
        <span className="inline-flex items-center gap-2">
          <Money amount={quote.total_cost} className={cn(isTestMode && "line-through opacity-70")} />
          {isTestMode && (
            <span className="text-xs font-normal text-muted-foreground">
              {t("sms_sent.mode.test.not_charged")}
            </span>
          )}
        </span>
      </QuoteRow>
      <QuoteRow label={t("sms_sent.confirm.wallet_balance")}>
        {quote.balance === null ? "—" : <Money amount={quote.balance} />}
      </QuoteRow>
      {showRemaining && (
        <QuoteRow label={t("sms_sent.confirm.remaining_balance")}>
          <Money amount={quote.remaining_balance ?? 0} className="text-primary" />
        </QuoteRow>
      )}
    </dl>
  );
}

export function SmsSendConfirmDialog({
  payload,
  mode,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: SmsSendConfirmDialogProps) {
  const { t } = useTranslation();
  const isTestMode = mode === "test";
  const [sendNow, setSendNow] = useState(false);
  const {
    mutate: loadQuote,
    data: quote,
    isPending: isQuoteLoading,
    isError: isQuoteError,
    reset: resetQuote,
  } = useApiMutation<SmsSendQuote, SmsSentPayload>({ url: "sms-store/preview" });

  useEffect(() => {
    setSendNow(false);
    if (payload) {
      loadQuote(payload);
    } else {
      resetQuote();
    }
  }, [payload, loadQuote, resetQuote]);

  const scheduledAt = quote?.scheduled_at ?? null;
  const isInsufficient = !!quote && !isTestMode && !quote.sufficient;
  const canConfirm = !!quote && !isQuoteLoading && !isSubmitting && canConfirmSmsSend(quote, mode);
  const ModeIcon = isTestMode ? FlaskConical : Send;

  return (
    <MyDialog
      open={payload !== null}
      onOpenChange={onOpenChange}
      title={isTestMode ? "sms_sent.confirm.test_title" : "sms_sent.confirm.title"}
      loading={isSubmitting}
      contentClassName={cn(isTestMode && "border-2 border-warning-foreground/30")}
      footer={({ close }) => (
        <>
          <MyButton action="cancel" type="button" variant="outline" onClick={close} disabled={isSubmitting}>
            {t("cancel")}
          </MyButton>
          <MyButton
            action="save"
            type="button"
            variant="default"
            loading={isSubmitting}
            disabled={!canConfirm}
            onClick={() => onConfirm({ sendNow: scheduledAt !== null && sendNow })}
          >
            <ModeIcon className="size-4" />
            {isTestMode ? t("sms_sent.confirm.test_submit") : t("sms_sent.confirm.submit")}
          </MyButton>
        </>
      )}
    >
      <div className="space-y-4">
        <div
          className={cn(
            "flex items-start gap-3 rounded-md p-3 text-sm",
            isTestMode ? "bg-warning text-warning-foreground" : "bg-muted/40 text-muted-foreground"
          )}
        >
          <ModeIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="space-y-1">
            {isTestMode && (
              <p className="text-xs font-bold uppercase tracking-wider">
                {t("sms_sent.confirm.test_badge")}
              </p>
            )}
            <p>{isTestMode ? t("sms_sent.confirm.test_notice") : t("sms_sent.confirm.live_notice")}</p>
          </div>
        </div>

        {isQuoteLoading && <QuoteSkeleton />}

        {isQuoteError && !isQuoteLoading && (
          <p role="alert" className="text-sm text-destructive">
            {t("sms_sent.confirm.quote_error")}
          </p>
        )}

        {quote && !isQuoteLoading && (
          <>
            <QuoteSummary quote={quote} isTestMode={isTestMode} />
            {quote.recipients === 0 && (
              <p className="text-sm text-muted-foreground">{t("sms_sent.confirm.no_recipients")}</p>
            )}
            {isInsufficient && <InsufficientBalanceAlert quote={quote} />}
            {scheduledAt && (
              <ScheduleNotice
                scheduledAt={scheduledAt}
                timezone={quote.timezone}
                sendNow={sendNow}
                onSendNowChange={setSendNow}
                disabled={isSubmitting}
              />
            )}
          </>
        )}
      </div>
    </MyDialog>
  );
}

export default SmsSendConfirmDialog;

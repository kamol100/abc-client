"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MyDialog } from "@/components/my-dialog";
import MyButton from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import { referralMoney } from "@/components/referrals/referral-amount";
import type { ReferralRow, ReferralSeller, ReferralTerms } from "@/components/referrals/referral-type";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";

export function ReferralQueryError({ retry }: { retry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-3 rounded-md border px-3 py-2" role="alert">
      <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
      <MyButton size="sm" variant="outline" action="sync" title="referral.actions.retry" onClick={retry} />
    </div>
  );
}

export function ReferralDenied() {
  const { t } = useTranslation();
  return <p className="rounded-md border p-4 text-sm text-muted-foreground" role="alert">{t("referral.denied")}</p>;
}

export function ReferralTermValue({ terms }: { terms: ReferralTerms }) {
  const { t, i18n } = useTranslation();
  const value = terms.commission_type === "fixed"
    ? referralMoney(terms.fixed_amount_minor ?? 0, i18n.language)
    : new Intl.NumberFormat(i18n.language, { style: "percent", maximumFractionDigits: 2 }).format((terms.rate_bps ?? 0) / 10_000);

  return <>{t(`referral.terms_display.${terms.commission_type}`, { value })}</>;
}

export function ReferralDetail({ row, endpoint }: { row: ReferralRow; endpoint: string }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const query = useApiQuery<ApiResponse<ReferralRow>>({
    queryKey: [endpoint, "detail", row.uuid], url: `${endpoint}/${row.uuid}`, pagination: false, enabled: open,
  });
  const detail = query.data?.data;
  const format = (amount: number) => referralMoney(amount, i18n.language);

  return (
    <MyDialog
      title="referral.details"
      open={open}
      onOpenChange={setOpen}
      trigger={<MyButton size="sm" variant="outline" icon={false} title="referral.details" />}
    >
      {query.isError && <ReferralQueryError retry={() => void query.refetch()} />}
      {!detail && !query.isError && <Skeleton className="h-40 w-full" />}
      {detail && (
        <dl className="grid min-h-40 gap-2 text-sm">
          <div><dt className="text-muted-foreground">{t("referral.fields.prospect_name")}</dt><dd className="break-words font-medium">{detail.prospect_name}</dd></div>
          <div><dt className="text-muted-foreground">{t("referral.fields.status")}</dt><dd>{t(`referral.status.${detail.status}`)}</dd></div>
          <div><dt className="text-muted-foreground">{t("referral.fields.commission_type")}</dt><dd><ReferralTermValue terms={detail} /></dd></div>
          {detail.decision_note && <div><dt className="text-muted-foreground">{t("referral.fields.decision_note")}</dt><dd className="whitespace-pre-wrap break-words">{detail.decision_note}</dd></div>}
          {detail.payout && <>
            <div><dt className="text-muted-foreground">{t("referral.fields.transfer_reference")}</dt><dd className="break-words">{detail.payout.transfer_reference}</dd></div>
            <div><dt className="text-muted-foreground">{t("referral.fields.paid_at")}</dt><dd>{new Date(detail.payout.paid_at).toLocaleString(i18n.language)}</dd></div>
            <div><dt className="text-muted-foreground">{t("referral.fields.method")}</dt><dd>{t(`referral.methods.${detail.payout.method}`)}</dd></div>
            <div><dt className="text-muted-foreground">{t("referral.commission")}</dt><dd>{format(detail.payout.amount_minor)}</dd></div>
          </>}
        </dl>
      )}
    </MyDialog>
  );
}

export function ReferralSellerDetail({ seller }: { seller: ReferralSeller }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const query = useApiQuery<ApiResponse<ReferralSeller>>({
    queryKey: ["platform-referral-sellers", "detail", seller.id],
    url: `platform-referral-sellers/${seller.id}`, pagination: false, enabled: open,
  });
  const contracts = query.data?.data.contracts;
  return (
    <MyDialog title="referral.contract_history" open={open} onOpenChange={setOpen}
      trigger={<MyButton size="sm" variant="outline" icon={false} title="referral.contract_history" />}
    >
      <p className="mb-3 break-words text-sm font-medium">{seller.display_name}</p>
      {query.isError && <ReferralQueryError retry={() => void query.refetch()} />}
      {!contracts && !query.isError && <Skeleton className="h-24 w-full" />}
      {contracts?.length === 0 && <p className="text-sm text-muted-foreground">{t("referral.no_contracts")}</p>}
      {contracts && contracts.length > 0 && (
        <ul className="divide-y rounded-md border text-sm">
          {contracts.map((contract) => (
            <li key={contract.id} className="flex flex-wrap justify-between gap-2 p-3">
              <span><ReferralTermValue terms={contract} /></span>
              <time dateTime={contract.effective_at} className="text-muted-foreground">
                {new Date(contract.effective_at).toLocaleString(i18n.language)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </MyDialog>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import MyButton from "@/components/my-button";
import SelectDropdown from "@/components/select-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferralDenied, ReferralQueryError } from "@/components/referrals/referral-detail";
import { ReferralCaptureForm } from "@/components/referrals/referral-form";
import { referralColumns, referralSellerColumns } from "@/components/referrals/referral-column";
import { ReferralEnrollmentForm } from "@/components/referrals/referral-seller-form";
import { referralMoney } from "@/components/referrals/referral-amount";
import { referralStatuses, type ReferralList, type ReferralSeller, type ReferralTotals } from "@/components/referrals/referral-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { type PaginatedApiResponse } from "@/hooks/use-api-query";
import { copyTextToClipboard } from "@/lib/helper/helper";

const totalKeys = ["pending", "payable", "paid"] as const;

function ReferralSummary({ totals, unavailable }: { totals?: ReferralTotals; unavailable: boolean }) {
  const { t, i18n } = useTranslation();

  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-4" aria-label={t("referral.totals")}>
      {totalKeys.map((status) => (
        <Card className="gap-1 px-2 py-3 sm:px-4" key={status}>
          <dt className="text-xs text-muted-foreground sm:text-sm">{t(`referral.status.${status}`)}</dt>
          <dd className="min-h-7 break-all text-base font-semibold tabular-nums sm:text-xl" data-referral-total={status}>
            {totals
              ? referralMoney(totals[`${status}_minor`], i18n.language)
              : unavailable ? t("referral.unavailable") : <Skeleton className="mt-1 h-5 w-2/3" />}
          </dd>
        </Card>
      ))}
    </dl>
  );
}

function ShareReferral({ seller, unavailable }: { seller?: ReferralList["data"]["seller"]; unavailable: boolean }) {
  const { t } = useTranslation();
  const link = useRef<HTMLAnchorElement>(null);
  const href = seller?.status === "active" ? `/demo-request?${new URLSearchParams({ ref: seller.code })}` : null;

  async function copyLink() {
    if (!link.current) return;
    const copied = await copyTextToClipboard(link.current.href);
    if (copied) {
      toast.success(t("referral.link_copied"));
    } else {
      toast.info(t("referral.copy_fallback"));
    }
  }

  return (
    <div className="flex min-h-14 min-w-0 flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 sm:gap-3">
      <span className="text-sm font-medium">{t("referral.share_link")}</span>
      <div className="min-w-0 flex-1 text-sm text-muted-foreground">
        {href ? (
          <Link className="break-all text-primary underline-offset-4 hover:underline" ref={link} href={href}>
            {href}
          </Link>
        ) : seller ? t("referral.inactive_code") : unavailable ? t("referral.unavailable") : <Skeleton className="h-4 w-3/4" />}
      </div>
      <MyButton size="sm" variant="outline" disabled={!href} onClick={() => void copyLink()}>
        <Copy aria-hidden />
        {t("referral.actions.copy")}
      </MyButton>
    </div>
  );
}

export default function ReferralTable({ platform = false }: { platform?: boolean }) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const endpoint = platform ? "platform-referrals" : "referrals";
  const allowed = hasPermission(`${endpoint}.access`);
  const statusForm = useForm<{ status: string | null }>({ defaultValues: { status: "" } });
  const status = useWatch({ control: statusForm.control, name: "status" });
  const params = useMemo(() => status ? { status } : undefined, [status]);
  const query = useApiQuery<ReferralList>({ url: endpoint, queryKey: [endpoint], params, enabled: allowed });
  const result = query.data?.data;
  const columns = useMemo(() => referralColumns(endpoint, result?.actions), [endpoint, result?.actions]);

  if (!allowed) return <ReferralDenied />;

  const addPermission = hasPermission(platform ? "platform-referrals.attribute" : "referrals.create");
  const canAdd = addPermission && (platform ? result?.actions.can_attribute : result?.actions.can_submit);
  const title = platform ? "referral.platform_title" : "referral.title";

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="referral-heading">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="referral-heading" className="text-2xl font-semibold tracking-tight">{t(title)}</h1>
          <p className="text-sm text-muted-foreground">{t(platform ? "referral.platform_intro" : "referral.intro")}</p>
        </div>
        {platform && hasPermission("platform-referral-sellers.access") && (
          <MyButton url="/platform-referral-sellers" variant="outline" icon={false} title="referral.sellers" />
        )}
      </header>
      <ReferralSummary totals={result?.totals} unavailable={query.isError} />
      {!platform && <ShareReferral seller={result?.seller} unavailable={query.isError} />}
      <Card className="min-w-0 gap-0 p-3">
        <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">{t("referral.list")}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <FormProvider {...statusForm}>
              <div className="w-44 max-w-full">
                <label htmlFor="status" className="sr-only">{t("referral.filter_status")}</label>
                <SelectDropdown
                  name="status"
                  placeholder="referral.all_statuses"
                  options={referralStatuses.map((value) => ({ value, label: `referral.status.${value}` }))}
                  isSearchable={false}
                />
              </div>
            </FormProvider>
            {canAdd && <ReferralCaptureForm assisted={platform} />}
            {query.isLoading && addPermission && <Skeleton className="h-8 w-28" />}
          </div>
        </div>
        {query.isError && <ReferralQueryError retry={() => void query.refetch()} />}
        {(!query.isError || result) && (
          <DataTable columns={columns} data={result?.data ?? []} toolbar={false}
            pagination={result?.pagination} setCurrentPage={query.setCurrentPage}
            isLoading={query.isLoading} isFetching={query.isFetching} queryKey={endpoint} />
        )}
      </Card>
    </section>
  );
}

export function ReferralSellerTable() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const endpoint = "platform-referral-sellers";
  const allowed = hasPermission(`${endpoint}.access`);
  const query = useApiQuery<PaginatedApiResponse<ReferralSeller>>({ url: endpoint, queryKey: [endpoint], enabled: allowed });

  if (!allowed) return <ReferralDenied />;

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="referral-sellers-heading">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 id="referral-sellers-heading" className="text-2xl font-semibold tracking-tight">{t("referral.sellers")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission("platform-referrals.access") && (
            <MyButton url="/platform-referrals" variant="outline" icon={false} title="referral.platform_title" />
          )}
          {hasPermission("platform-referral-sellers.create") && <ReferralEnrollmentForm />}
        </div>
      </header>
      {query.isError && <ReferralQueryError retry={() => void query.refetch()} />}
      {(!query.isError || query.data) && (
        <DataTable columns={referralSellerColumns} data={query.data?.data.data ?? []} toolbar={false}
          pagination={query.data?.data.pagination} setCurrentPage={query.setCurrentPage}
          isLoading={query.isLoading} isFetching={query.isFetching} queryKey={endpoint} />
      )}
    </section>
  );
}

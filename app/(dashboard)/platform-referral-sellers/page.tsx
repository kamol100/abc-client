import type { Metadata } from "next";
import { ReferralSellerTable } from "@/components/referrals/referral-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = { title: t("referral.sellers") };

export default function Page() {
  return <ReferralSellerTable />;
}

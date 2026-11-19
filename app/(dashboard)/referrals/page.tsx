import type { Metadata } from "next";
import ReferralTable from "@/components/referrals/referral-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = { title: t("referral.title") };

export default function Page() {
  return <ReferralTable />;
}
